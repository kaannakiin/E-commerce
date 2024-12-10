import { FindProducts } from "@/lib/Tami/prismaTami/Findİtem";
import { tami } from "@/lib/Tami/tamiClient";
import { PaymentRequest } from "@/lib/Tami/types";
import { nonAuthSchema, variantIdQtySchema } from "@/zodschemas/authschema";
import { createId } from "@paralleldrive/cuid2";
import { NextRequest, NextResponse } from "next/server";
import { number } from "zod";

export async function POST(req: NextRequest) {
  try {
    const { data, ...rest } = await req.json();
    const { address, agreements, cardInfo, email, firstName, lastName, phone } =
      nonAuthSchema.parse(data);
    const ip =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    if (
      agreements.privacyAccepted !== true ||
      agreements.termsAccepted !== true
    ) {
      return NextResponse.json(
        {
          message: "Gizlilik ve Kullanım Koşulları kabul edilmelidir",
          status: 400,
        },
        { status: 400 },
      );
    }
    const binCheckResponse = await tami.binCheck(
      cardInfo.cardNumber.replace(/\s/g, "").slice(0, 6),
    );
    if (
      cardInfo.threeDsecure === true ||
      binCheckResponse.cardType === "DEBIT"
    ) {
      //3D secure işlemi
    }
    if (cardInfo.threeDsecure === false) {
      const result = await FindProducts(rest.variantIdQty);
      // const amount = result.data.reduce(
      //   (acc, item) => acc + item.totalPrice,
      //   0,
      // );
      const amount = 415;
      const cardNumber = "4824910501747014";
      const currency = "TRY";
      const installmentCount = 1;

      const paymentRequest = {
        currency: currency,
        installmentCount: installmentCount,
        motoInd: false,
        paymentGroup: "PRODUCT",
        paymentChannel: "WEB",
        card: {
          holderName: "Mesut Sarıtaş",
          cvv: "",
          expireMonth: 4,
          expireYear: 2026,
          number: cardNumber,
        },
        billingAddress: {
          address: "Deneme adresi",
          city: "İstanbul",
          companyName: "Deneme Firması",
          country: "Türkiye",
          district: "Maltepe",
          contactName: "Oğuzhan Okur",
          phoneNumber: "07505555555",
          zipCode: "34846",
        },
        shippingAddress: {
          address: "Deneme adresi",
          city: "İstanbul",
          companyName: "Deneme Firması",
          country: "Türkiye",
          district: "Maltepe",
          contactName: "Oğuzhan Okur",
          phoneNumber: "07505555555",
          zipCode: "34846",
        },
        buyer: {
          ipAddress: "127.0.0.1",
          buyerId: "cc9be1332c6a4932ab0e9ce0a103cd75",
          name: "Oğuzhan",
          surName: "Okur",
          identityNumber: "11111111111",
          city: "İstanbul",
          country: "Türkiye",
          zipCode: "34846",
          emailAddress: "destek@garantibbva.com.tr",
          phoneNumber: "07325555555",
          registrationAddress: "Maltepe",
          lastLoginDate: "2023-08-04T11:52:05.151",
          registrationDate: "2023-07-25T11:52:05.151",
        },

        orderId: createId(),
        amount: amount,
      };

      const request = await tami.makePayment(paymentRequest);
      return NextResponse.json(
        {
          message: "Başarılı",
          status: 200,
        },
        { status: 200 },
      );
    }
    return NextResponse.json(
      {
        message: "Başarısız",
        status: 400,
      },
      { status: 400 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Beklenmedik bir hata oluştu. Lütfen terkar deneyiniz",
        status: 500,
      },
      { status: 500 },
    );
  }
}
