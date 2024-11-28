import { DiscountCheck } from "@/actions/user/discount-check";
import { auth } from "@/auth";
import { iyzico } from "@/lib/iyzicoClient";
import { handlingError } from "@/lib/iyzicoErrorHandling";
import { generateNon3DSignature } from "@/lib/IyzicoHelper";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/rateLimitRedis";
import {
  checkoutFormSchema,
  CreditCardSchema,
  discountCode,
  idForEverything,
  variantIdQtySchema,
} from "@/zodschemas/authschema";
import { createId } from "@paralleldrive/cuid2";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const ip =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    const canProceed = await rateLimiter(ip);
    if (!canProceed.success) {
      return NextResponse.json(
        { message: "Rate limit exceeded" },
        { status: 429 },
      );
    }
    if (session?.user) {
      const data = await req.json();
      const { cardHolderName, cardNumber, cvc, expireMonth, expireYear } =
        CreditCardSchema.parse(data.data);
      idForEverything.parse(data.address);
      const userAddress = await prisma.address.findUnique({
        where: {
          id: data.address,
        },
        select: {
          id: true,
          addressDetail: true,
          city: true,
          addressTitle: true,
          district: true,
          email: true,
          name: true,
          surname: true,
          phone: true,
        },
      });
      const code = discountCode.parse({ code: data.params || null });
      const userProducts = variantIdQtySchema.parse(data.variantIdQty);
      const discountCodeCheck = await DiscountCheck(
        code.code,
        userProducts.map((item) => item.variantId),
      ).then((res) => {
        if (!res.success) {
          return null;
        }
        if (res.success) {
          return { type: res.discountType, amount: res.discountAmount };
        }
      });
      const products = await prisma.variant
        .findMany({
          where: {
            id: {
              in: userProducts.map((item) => item.variantId),
            },
          },
          select: {
            id: true,
            discount: true,
            price: true,
            product: {
              select: {
                taxRate: true,
                name: true,
                categories: {
                  take: 1,
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        })
        .then((variants) =>
          variants.map((variant) => ({
            id: variant.id,
            name: variant.product.name,
            price:
              variant.price +
              (variant.price * variant.product.taxRate) / 100 -
              ((variant.price +
                (variant.price * variant.product.taxRate) / 100) *
                variant.discount) /
                100,
            quantity:
              userProducts.find((item) => item.variantId === variant.id)
                ?.quantity || 0,
            categoryName: variant.product.categories[0].name,
            itemType: "PHYSICAL",
          })),
        );
      const basketItems = products.flatMap((product) =>
        Array.from({ length: product.quantity }, () => ({
          id: product.id,
          name: product.name,
          price: product.price.toString(),
          category1: product.categoryName,
          itemType: product.itemType,
        })),
      );
      const shippingAddress = {
        contactName: userAddress.name + " " + userAddress.surname,
        city: userAddress.city,
        country: "Türkiye",
        address: userAddress.addressDetail,
      };
      const billingAddress = {
        contactName: userAddress.name + " " + userAddress.surname,
        city: userAddress.city,
        country: "Türkiye",
        address: userAddress.addressDetail,
      };
      const buyer = {
        id: session.user.id,
        name: userAddress.name,
        surname: userAddress.surname,
        email: userAddress.email,
        identityNumber: "11111111111",
        registrationAddress: userAddress.addressDetail,
        city: userAddress.city,
        country: "Türkiye",
        ip: ip,
        gsmNumber: userAddress.phone,
      };
      const paymentCard = {
        cardHolderName: cardHolderName,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expireYear: expireYear,
        expireMonth: expireMonth,
        cvc: cvc,
      };
      const token = createId();
      const paymentRequset = {
        locale: "tr",
        conversationId: createId(),
        callbackUrl: `http://localhost:3000/api/user/payment/callback?token=${token}`,
        price: basketItems
          .reduce((acc, item) => acc + parseFloat(item.price), 0)
          .toString(),
        paidPrice:
          discountCodeCheck === null
            ? basketItems
                .reduce((acc, item) => acc + parseFloat(item.price), 0)
                .toString()
            : discountCodeCheck.type === "FIXED"
              ? (
                  basketItems.reduce(
                    (acc, item) => acc + parseFloat(item.price),
                    0,
                  ) - discountCodeCheck.amount
                ).toFixed(2)
              : (
                  basketItems.reduce(
                    (acc, item) => acc + parseFloat(item.price),
                    0,
                  ) -
                  (basketItems.reduce(
                    (acc, item) => acc + parseFloat(item.price),
                    0,
                  ) *
                    discountCodeCheck.amount) /
                    100
                ).toFixed(2),
        currency: "TRY",
        installment: "1",
        basketId: createId(),
        paymentChannel: "WEB",
        paymentGroup: "PRODUCT",
        paymentCard: paymentCard,
        buyer: buyer,
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        basketItems: basketItems,
      };
      const response = await iyzico.initialize3DS(paymentRequset);
      if (response.status === "success") {
        await prisma.$transaction(async (tx) => {
          await tx.tempPayment.create({
            data: {
              token: token,
              userId: session.user.id,
              ip,
              paymentId: response.paymentId,
              paidPrice: paymentRequset.paidPrice,
              basketId: paymentRequset.basketId,
              addressId: userAddress.id,
              discountCode: code.code,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
          });
        });
        const verify = generateNon3DSignature({
          paymentId: response.paymentId,
          conversationId: response.conversationId,
        });
        if (
          verify !== response.signature ||
          response.conversationId !== paymentRequset.conversationId
        ) {
          return NextResponse.json(
            {
              status: 400,
              message:
                "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz.",
            },
            { status: 400 },
          );
        }
        const decodedHtmlContent = Buffer.from(
          response.threeDSHtmlContent,
          "base64",
        ).toString("utf-8");
        return new NextResponse(decodedHtmlContent, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        });
      }
      if (response.status === "failure") {
        return handlingError(response.errorCode);
      }
    } else {
      const data = await req.json();
      const { firstName, lastName, email, phone, address, cardInfo } =
        checkoutFormSchema.parse(data.data);
      const userProducts = variantIdQtySchema.parse(data.variantIdQty);
      const code = discountCode.parse({ code: data.params || null });
      const discountCodeCheck = await DiscountCheck(
        code.code,
        userProducts.map((item) => item.variantId),
      ).then((res) => {
        if (!res.success) {
          return null;
        }
        if (res.success) {
          return { type: res.discountType, amount: res.discountAmount };
        }
      });
      const products = await prisma.variant
        .findMany({
          where: {
            id: {
              in: userProducts.map((item) => item.variantId),
            },
          },
          select: {
            id: true,
            discount: true,
            price: true,
            product: {
              select: {
                taxRate: true,
                name: true,
                categories: {
                  take: 1,
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        })
        .then((variants) =>
          variants.map((variant) => ({
            id: variant.id,
            name: variant.product.name,
            price:
              variant.price +
              (variant.price * variant.product.taxRate) / 100 -
              ((variant.price +
                (variant.price * variant.product.taxRate) / 100) *
                variant.discount) /
                100,
            quantity:
              userProducts.find((item) => item.variantId === variant.id)
                ?.quantity || 0,
            categoryName: variant.product.categories[0].name,
            itemType: "PHYSICAL",
          })),
        );
      const basketItems = products.flatMap((product) =>
        Array.from({ length: product.quantity }, () => ({
          id: product.id,
          name: product.name,
          price: product.price.toString(),
          category1: product.categoryName,
          itemType: product.itemType,
        })),
      );
      const shippingAddress = {
        contactName: firstName + " " + lastName,
        city: address.city,
        country: "Türkiye",
        address: address.street,
      };
      const billingAddress = {
        contactName: firstName + " " + lastName,
        city: address.city,
        country: "Türkiye",
        address: address.street,
      };
      const buyer = {
        id: createId(),
        name: firstName,
        surname: lastName,
        email: email,
        identityNumber: "11111111111",
        registrationAddress: address.street,
        city: address.city,
        country: "Türkiye",
        ip: ip,
        gsmNumber: phone,
      };
      const paymentCard = {
        cardHolderName: cardInfo.cardHolderName,
        cardNumber: cardInfo.cardNumber.replace(/\s/g, ""),
        expireYear: cardInfo.expireYear,
        expireMonth: cardInfo.expireMonth,
        cvc: cardInfo.cvc,
      };
      const token = createId();
      const paymentRequset = {
        locale: "tr",
        conversationId: createId(),
        callbackUrl: `http://localhost:3000/api/user/payment/callback?token=${token}`,
        price: basketItems
          .reduce((acc, item) => acc + parseFloat(item.price), 0)
          .toString(),
        paidPrice:
          discountCodeCheck === null
            ? basketItems
                .reduce((acc, item) => acc + parseFloat(item.price), 0)
                .toString()
            : discountCodeCheck.type === "FIXED"
              ? (
                  basketItems.reduce(
                    (acc, item) => acc + parseFloat(item.price),
                    0,
                  ) - discountCodeCheck.amount
                ).toFixed(2)
              : (
                  basketItems.reduce(
                    (acc, item) => acc + parseFloat(item.price),
                    0,
                  ) -
                  (basketItems.reduce(
                    (acc, item) => acc + parseFloat(item.price),
                    0,
                  ) *
                    discountCodeCheck.amount) /
                    100
                ).toFixed(2),
        currency: "TRY",
        installment: "1",
        basketId: createId(),
        paymentChannel: "WEB",
        paymentGroup: "PRODUCT",
        paymentCard: paymentCard,
        buyer: buyer,
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        basketItems: basketItems,
      };
      const response = await iyzico.initialize3DS(paymentRequset);
      if (response.status === "success") {
        const verifyCheck =
          generateNon3DSignature({
            paymentId: response.paymentId,
            conversationId: response.conversationId,
          }) === response.signature;
        if (!verifyCheck) {
          return NextResponse.json({
            status: 400,
            message:
              "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz.",
          });
        }
        await prisma.$transaction(async (tx) => {
          const userAddress = await tx.address.create({
            data: {
              id: buyer.id,
              name: firstName,
              surname: lastName,
              email: email,
              phone: phone,
              addressDetail: address.street,
              city: address.city,
              district: address.district,
            },
          });
          await tx.tempPayment.create({
            data: {
              token: token,
              ip,
              paymentId: response.paymentId,
              paidPrice: paymentRequset.paidPrice,
              basketId: paymentRequset.basketId,
              addressId: userAddress.id,
              discountCode: code.code,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
          });
        });
        const decodedHtmlContent = Buffer.from(
          response.threeDSHtmlContent,
          "base64",
        ).toString("utf-8");
        return new NextResponse(decodedHtmlContent, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        });
      }
      if (response.status === "failure") {
        return handlingError(response.errorCode);
      }
      return NextResponse.json(
        {
          status: 400,
          message: "Invalid request",
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        status: 400,
        message: "Invalid request",
      },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        error: true,
        message: "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz.",
      },
      { status: 500 },
    );
  }
}
