import { DiscountCheck } from "@/actions/user/discount-check";
import { deleteAddress } from "@/app/(kullanici)/hesabim/adres-defterim/_actions/AddressActions";
import { auth } from "@/auth";
import {
  AuthUserCreateOrder,
  createTempatureAddress,
  findAddressForIyzıco,
  findProductForIyzico,
  findUserByIdForIyzico,
  groupedItemTransactions,
  NonAuthUserCreateOrder,
} from "@/lib/İyzico/helper/helper";
import { iyzico } from "@/lib/İyzico/iyzicoClient";
import { paymentRequest } from "@/lib/İyzico/types";
import {
  AuthUserPaymentDataSchema,
  NonAuthPaymentDataSchema,
} from "@/zodschemas/authschema";
import { createId } from "@paralleldrive/cuid2";
import { NextRequest, NextResponse } from "next/server";
function errorHandler(code: string) {
  switch (code) {
    case "12":
      return "Kart numarası hatalı. Lütfen kart numarasını kontrol edip tekrar deneyiniz.";
    case "13":
      return "Son kullanma tarihi hatalı. Lütfen kartınızın üzerindeki son kullanma tarihini kontrol ediniz.";
    case "14":
      return "Son kullanma tarihi hatalı. Lütfen kartınızın üzerindeki ay ve yıl bilgilerini kontrol ediniz.";
    case "15":
      return "CVC hatalı. Lütfen kartınızın arkasındaki 3 haneli güvenlik kodunu kontrol ediniz.";
    case "16":
      return "Ad soyad bilgisi hatalı. Lütfen kart üzerindeki isim ile girdiğiniz ismin aynı olduğunu kontrol ediniz.";
    case "17":
      return "Son kullanma tarihi hatalı. Lütfen kartınızın son kullanma tarihini kontrol ediniz.";
    default:
      return "Bir hata oluştu. Lütfen kart bilgilerinizi kontrol edip tekrar deneyiniz.";
  }
}
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    const session = await auth();
    if (!session) {
      const data = await req.json();
      const {
        data: UserInfo,
        params: discountCode,
        variantIdQty,
      } = NonAuthPaymentDataSchema.parse(data);
      const binCheck = await iyzico.checkBin(
        UserInfo.cardInfo.cardNumber.replace(/\s/g, "").slice(0, 6),
      );
      if (binCheck.status !== "success") {
        return NextResponse.json(
          {
            status: 400,
            message:
              "Kartınız desteklenmemektedir. Lütfen başka bir kart deneyiniz.",
          },
          { status: 400 },
        );
      }
      const discount = { success: false, discountType: "", discountAmount: 0 };
      if (discountCode) {
        await DiscountCheck(
          discountCode,
          variantIdQty.map((item) => item.variantId),
        ).then((res) => {
          discount.success = res.success;
          discount.discountType = res.discountType;
          discount.discountAmount = res.discountAmount;
        });
      }
      const basketItems = await findProductForIyzico(variantIdQty);
      if (basketItems.status !== 200) {
        return NextResponse.json(
          {
            status: 404,
            message:
              basketItems.message ||
              "Bir hata oluştu. Lütfen tekrar deneyiniz.",
          },
          { status: 404 },
        );
      }
      const price = basketItems.data.reduce(
        (acc, item) => acc + parseFloat(item.price),
        0,
      );
      const paymentRequest: paymentRequest = {
        locale: "tr",
        paymentChannel: "WEB",
        paymentGroup: "PRODUCT",
        price: price,
        paidPrice: discount.success
          ? discount.discountType === "FIXED"
            ? price - discount.discountAmount
            : price - (price * discount.discountAmount) / 100
          : price,
        billingAddress: {
          address:
            UserInfo.address.street +
            " " +
            UserInfo.address.city +
            " " +
            UserInfo.address.district,
          city: UserInfo.address.city,
          country: "Türkiye",
          contactName: UserInfo.firstName + " " + UserInfo.lastName,
        },
        shippingAddress: {
          address:
            UserInfo.address.street +
            " " +
            UserInfo.address.city +
            " " +
            UserInfo.address.district,
          city: UserInfo.address.city,
          country: "Türkiye",
          contactName: UserInfo.firstName + " " + UserInfo.lastName,
        },
        buyer: {
          id: createId(),
          email: UserInfo.email,
          identityNumber: "11111111111",
          name: UserInfo.firstName,
          surname: UserInfo.lastName,
          registrationAddress:
            UserInfo.address.street +
            " " +
            UserInfo.address.city +
            " " +
            UserInfo.address.district,
          city: UserInfo.address.city,
          country: "Türkiye",
          ip: ip,
        },
        basketItems: basketItems.data,
        paymentCard: {
          cardHolderName: UserInfo.cardInfo.cardHolderName,
          cardNumber: UserInfo.cardInfo.cardNumber.replace(/\s/g, ""),
          expireMonth: UserInfo.cardInfo.expireMonth,
          expireYear: UserInfo.cardInfo.expireYear,
          cvc: UserInfo.cardInfo.cvc,
        },
      };
      if (
        UserInfo.cardInfo.threeDsecure ||
        binCheck.cardType === "DEBIT_CARD"
      ) {
        const addressId = await createTempatureAddress({
          city: UserInfo.address.city,
          district: UserInfo.address.district,
          addressDetail: UserInfo.address.street,
          email: UserInfo.email,
          name: UserInfo.firstName,
          surname: UserInfo.lastName,
          phone: UserInfo.phone,
        });
        paymentRequest.callbackUrl = `http:localhost:3000/api/user/payment/callback?nai=${addressId}&ip=${ip}`;
        if (discountCode) {
          paymentRequest.callbackUrl += `&di=${discountCode}`;
        }
        const request = await iyzico.payment3D(paymentRequest);
        if (request.status === "failure") {
          await deleteAddress(addressId);
          return NextResponse.json(
            {
              status: 400,
              message: errorHandler(request.errorCode).toString(),
            },
            { status: 400 },
          );
        }

        const htmlContent = atob(request.threeDSHtmlContent);
        return NextResponse.json(
          {
            status: 203,
            htmlContent: htmlContent,
            message: "3D Secure doğrulama gerekiyor",
          },
          {
            status: 203,
          },
        );
      } else {
        const request = await iyzico.paymentNon3D(paymentRequest);
        if (request.status !== "success") {
          return NextResponse.json(
            {
              status: 400,
              message: errorHandler(request.errorCode).toString(),
            },
            { status: 400 },
          );
        }
        const cardType = {
          cardType: request.cardType,
          cardAssociation: request.cardAssociation,
          cardFamily: request.cardFamily,
          maskedCardNumber: `${request.binNumber}******${request.lastFourDigits}`,
        };
        const userInfo = {
          name: UserInfo.firstName,
          surname: UserInfo.lastName,
          email: UserInfo.email,
          phone: UserInfo.phone,
          city: UserInfo.address.city,
          district: UserInfo.address.district,
          addressDetail: UserInfo.address.street,
        };
        const items = await groupedItemTransactions(request.itemTransactions);
        const orderNumber = await NonAuthUserCreateOrder({
          cardType,
          items,
          discountCode,
          paymentId: request.paymentId,
          addressInfo: userInfo,
          ip: ip,
        });
        return NextResponse.json(
          {
            status: 200,
            orderNumber: orderNumber,
            message: "Ödeme başarılı",
          },
          { status: 200 },
        );
      }
    } else {
      const data = await req.json();
      const {
        address: addressId,
        data: cardInfo,
        discountCode,
        variantIdQty,
      } = AuthUserPaymentDataSchema.parse(data);
      const binCheck = await iyzico.checkBin(
        cardInfo.cardNumber.replace(/\s/g, "").slice(0, 6),
      );
      const discount = { success: false, discountType: "", discountAmount: 0 };
      if (discountCode) {
        await DiscountCheck(
          discountCode,
          variantIdQty.map((item) => item.variantId),
        ).then((res) => {
          discount.success = res.success;
          discount.discountType = res.discountType;
          discount.discountAmount = res.discountAmount;
        });
      }

      if (binCheck.status !== "success") {
        return NextResponse.json(
          {
            status: 400,
            message:
              "Kartınız desteklenmemektedir. Lütfen başka bir kart deneyiniz.",
          },
          { status: 400 },
        );
      }
      const basketItems = await findProductForIyzico(variantIdQty);
      if (basketItems.status !== 200) {
        return NextResponse.json(
          { status: 404, message: "Bir hata oluştu. Lütfen tekrar deneyiniz." },
          { status: 404 },
        );
      }
      const fullAddress = await findAddressForIyzıco(addressId);
      if (fullAddress.status !== 200) {
        return NextResponse.json(
          { status: 404, message: "Bir hata oluştu. Lütfen tekrar deneyiniz." },
          { status: 404 },
        );
      }
      const buyer = await findUserByIdForIyzico(session.user.id);
      if (buyer.status !== 200) {
        return NextResponse.json(
          { status: 404, message: "Bir hata oluştu. Lütfen tekrar deneyiniz." },
          { status: 404 },
        );
      }
      const price = basketItems.data.reduce(
        (acc, item) => acc + parseFloat(item.price),
        0,
      );
      const paymentRequest: paymentRequest = {
        paymentChannel: "WEB",
        paymentGroup: "PRODUCT",
        locale: "tr",
        price: price,
        paidPrice: discount.success
          ? discount.discountType === "FIXED"
            ? price - discount.discountAmount
            : price - (price * discount.discountAmount) / 100
          : price,
        buyer: {
          ...buyer.user,
          city: fullAddress.city,
          registrationAddress: fullAddress.registrationAddress,
          country: "Türkiye",
          ip: ip,
        },
        shippingAddress: fullAddress.shippingAddress,
        billingAddress: fullAddress.billingAddress,
        basketItems: basketItems.data,
        paymentCard: {
          cardHolderName: cardInfo.cardHolderName,
          cardNumber: cardInfo.cardNumber.replace(/\s/g, ""),
          expireMonth: cardInfo.expireMonth,
          expireYear: cardInfo.expireYear,
          cvc: cardInfo.cvc,
        },
      };
      if (binCheck.cardType === "DEBIT_CARD" || cardInfo.threeDsecure) {
        paymentRequest.callbackUrl = `http:localhost:3000/api/user/payment/callback?ai=${addressId}&uid=${session.user.id}&ip=${ip}`;
        if (discountCode) {
          paymentRequest.callbackUrl += `&di=${discountCode}`;
        }
        const request = await iyzico.payment3D(paymentRequest);
        if (request.status === "failure") {
          return NextResponse.json(
            {
              status: 400,
              message: errorHandler(request.errorCode).toString(),
            },
            { status: 400 },
          );
        }

        const htmlContent = atob(request.threeDSHtmlContent);
        return NextResponse.json(
          {
            status: 203,
            htmlContent: htmlContent,
            message: "3D Secure doğrulama gerekiyor",
          },
          {
            status: 203,
          },
        );
      } else {
        const request = await iyzico.paymentNon3D(paymentRequest);
        if (request.status !== "success") {
          return NextResponse.json(
            {
              status: 400,
              message: errorHandler(request.errorCode).toString(),
            },
            { status: 400 },
          );
        }
        const cardType = {
          cardType: request.cardType,
          cardAssociation: request.cardAssociation,
          cardFamily: request.cardFamily,
          maskedCardNumber: `${request.binNumber}******${request.lastFourDigits}`,
        };
        const items = await groupedItemTransactions(request.itemTransactions);
        const orderNumber = await AuthUserCreateOrder({
          userId: session.user.id,
          addressId,
          items,
          discountCode,
          paymentId: request.paymentId,
          cardType,
          ip,
        });
        return NextResponse.json(
          {
            status: 200,
            message: orderNumber,
          },
          { status: 200 },
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      { status: 500, message: "Bir hata oluştu. Lütfen tekrar deneyiniz." },
      { status: 500 },
    );
  }
}
