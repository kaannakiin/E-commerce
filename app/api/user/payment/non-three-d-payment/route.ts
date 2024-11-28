import { DiscountCheck } from "@/actions/user/discount-check";
import { auth } from "@/auth";
import { iyzico } from "@/lib/iyzicoClient";
import { handlingError } from "@/lib/iyzicoErrorHandling";
import {
  generateNon3DSignature,
  generateOrderNumber,
  groupTransactionsByItemId,
} from "@/lib/IyzicoHelper";
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
    const ip =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    const session = await auth();
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
      const userProducts = variantIdQtySchema.parse(data.variantIdQty);
      const code = discountCode.parse({ code: data.params || null });
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
      const paymentRequest = {
        locale: "tr",
        conversationId: createId(),
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
      const request = await iyzico.createPayment(paymentRequest);
      if (request.status === "success") {
        const signatureCheck =
          generateNon3DSignature({
            type: "non3D",
            paymentId: request.paymentId,
            currency: "TRY",
            basketId: request.basketId,
            conversationId: paymentRequest.conversationId,
            paidPrice: request.paidPrice.toString(),
            price: request.price.toString(),
          }) === request.signature;
        if (!signatureCheck) {
          return NextResponse.json(
            {
              status: 404,
              message: "Beklenmeyen bir hata oluştu",
            },
            {
              status: 404,
            },
          );
        }
        const items = groupTransactionsByItemId(request.itemTransactions);
        const orderNumber = await prisma.$transaction(async (tx) => {
          try {
            const orderNumber = await tx.order.create({
              data: {
                ip,
                orderNumber: generateOrderNumber(),
                paymentId: request.paymentId,
                paidPrice: parseFloat(
                  items
                    .reduce(
                      (acc, item) => acc + item.paidPrice * item.quantity,
                      0,
                    )
                    .toFixed(2),
                ),
                address: {
                  connect: {
                    id: userAddress.id,
                  },
                },
                orderItems: {
                  createMany: {
                    data: items.map((item) => ({
                      variantId: item.itemId,
                      quantity: item.quantity,
                      price: item.price,
                      paidPrice: item.paidPrice,
                      totalPrice: item.paidPrice * item.quantity,
                      iyzicoPerPrice: item.merchantPayoutAmount,
                      iyzicoPerTotal: item.merchantPayoutAmount * item.quantity,
                    })),
                  },
                },
                user: {
                  connect: {
                    id: session.user.id,
                  },
                },
                discountCode: discountCodeCheck
                  ? { connect: { code: code.code } }
                  : undefined,
                paidPriceIyzico: parseFloat(
                  items
                    .reduce(
                      (acc, item) =>
                        acc + item.merchantPayoutAmount * item.quantity,
                      0,
                    )
                    .toFixed(2),
                ),
              },
            });
            if (orderNumber.discountCodeId) {
              await tx.discountCode.update({
                where: {
                  id: orderNumber.discountCodeId,
                },
                data: {
                  uses: {
                    increment: 1,
                  },
                },
              });
            }
            return orderNumber.orderNumber;
          } catch (error) {
            return NextResponse.json(
              {
                status: 500,
                message: "Internal Server Error",
              },
              {
                status: 500,
              },
            );
          }
        });
        return NextResponse.json(
          {
            status: 200,
            message: "Ödeme başarılı",
            redirectUrl: `/siparis?orderNumber=${orderNumber}&status=basarili`,
          },
          { status: 200 },
        );
      }
      if (request.status === "failure") {
        return handlingError(request.errorCode);
      }
      return NextResponse.json(
        {
          status: 400,
          message: "Ödeme başarısız",
        },
        { status: 400 },
      );
    } else {
      try {
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
        const userAddress = await prisma.address.create({
          data: {
            name: firstName,
            surname: lastName,
            email: email,
            phone: phone,
            city: address.city,
            district: address.district,
            addressDetail: address.street,
          },
        });
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
          id: createId(),
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
          cardHolderName: cardInfo.cardHolderName,
          cardNumber: cardInfo.cardNumber.replace(/\s/g, ""),
          expireYear: cardInfo.expireYear,
          expireMonth: cardInfo.expireMonth,
          cvc: cardInfo.cvc,
        };
        const paymentRequest = {
          locale: "tr",
          conversationId: createId(),
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
        const request = await iyzico.createPayment(paymentRequest);
        if (request.status === "success") {
          const signatureCheck =
            generateNon3DSignature({
              type: "non3D",
              paymentId: request.paymentId,
              currency: "TRY",
              basketId: request.basketId,
              conversationId: paymentRequest.conversationId,
              paidPrice: request.paidPrice.toString(),
              price: request.price.toString(),
            }) === request.signature;
          if (!signatureCheck) {
            return NextResponse.json(
              {
                status: 404,
                message: "Beklenmeyen bir hata oluştu",
              },
              {
                status: 404,
              },
            );
          }
          const items = groupTransactionsByItemId(request.itemTransactions);
          const orderNumber = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
              data: {
                ip,
                orderNumber: generateOrderNumber(),
                paidPrice: parseFloat(
                  items
                    .reduce(
                      (acc, item) => acc + item.paidPrice * item.quantity,
                      0,
                    )
                    .toFixed(2),
                ),
                paymentId: request.paymentId,
                address: {
                  connect: {
                    id: userAddress.id,
                  },
                },
                orderItems: {
                  createMany: {
                    data: items.map((item) => ({
                      variantId: item.itemId,
                      quantity: item.quantity,
                      price: item.price,
                      paidPrice: item.paidPrice,
                      totalPrice: item.paidPrice * item.quantity,
                      iyzicoPerPrice: item.merchantPayoutAmount,
                      iyzicoPerTotal: item.merchantPayoutAmount * item.quantity,
                    })),
                  },
                },
                discountCode: discountCodeCheck
                  ? { connect: { code: code.code } }
                  : undefined,
                paidPriceIyzico: parseFloat(
                  items
                    .reduce(
                      (acc, item) =>
                        acc + item.merchantPayoutAmount * item.quantity,
                      0,
                    )
                    .toFixed(2),
                ),
              },
            });
            if (order.discountCodeId) {
              await tx.discountCode.update({
                where: {
                  id: order.discountCodeId,
                },
                data: {
                  uses: {
                    increment: 1,
                  },
                },
              });
            }
            return order.orderNumber;
          });
          return NextResponse.json(
            {
              status: 200,
              message: "Ödeme başarılı",
              redirectUrl: `/siparis?orderNumber=${orderNumber}&status=basarili`,
            },
            { status: 200 },
          );
        }
        if (request.status === "failure") {
          return handlingError(request.errorCode);
        }
      } catch (error) {
        console.log(error);
        return NextResponse.json(
          {
            status: 500,
            message: "Internal Server Error",
          },
          { status: 500 },
        );
      }
    }
    return NextResponse.json(
      { status: 400, message: "Invalid request" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { status: 500, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
