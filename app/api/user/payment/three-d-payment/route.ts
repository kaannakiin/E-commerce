import { Calculate } from "@/lib/calcBilling";
import { createPaymentSession } from "@/lib/createPaymentSession";
import { iyzico } from "@/lib/iyzicoClient";
import { prisma } from "@/lib/prisma";
import { generateIyzicoSignature } from "@/lib/verifyIyzico";
import { createId } from "@paralleldrive/cuid2";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const bill = await Calculate(data.variantIdQty, data.params);
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for") ||
      "127.0.0.1";
    const paymentSession = await createPaymentSession(data, bill, data.params);
    const isDevelopment = process.env.NODE_ENV === "development";
    const callbackUrl = isDevelopment
      ? `http://localhost:3000/api/user/payment/callback?token=${paymentSession.temp.token}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/user/payment/callback?token=${paymentSession.temp.token}`;

    const paymentRequest = {
      locale: "tr",
      conversationId: paymentSession.temp.token,
      price: paymentSession.temp.paidPrice.toString(),
      paidPrice: paymentSession.temp.paidPrice.toString(),
      currency: "TRY",
      installment: "1",
      basketId: paymentSession.temp.basketId,
      paymentChannel: "WEB",
      paymentGroup: "PRODUCT",
      callbackUrl,
      paymentCard: {
        cardHolderName: data.data.cardInfo.cardHolderName,
        cardNumber: data.data.cardInfo.cardNumber,
        expireMonth: data.data.cardInfo.expireMonth,
        expireYear: data.data.cardInfo.expireYear,
        cvc: data.data.cardInfo.cvc,
      },
      buyer: {
        id: createId(),
        name: data.data.firstName,
        surname: data.data.lastName,
        gsmNumber: data.data.phone,
        email: data.data.email,
        identityNumber: "11111111111",
        registrationAddress: `${data.data.address.street} ${data.data.address.city} ${data.data.address.district}`,
        ip,
        city: data.data.address.city,
        country: "Turkey",
      },
      shippingAddress: {
        contactName: `${data.data.firstName} ${data.data.lastName}`,
        city: data.data.address.city,
        country: "Turkey",
        address: `${data.data.address.street} ${data.data.address.city} ${data.data.address.district}`,
      },
      billingAddress: {
        contactName: `${data.data.firstName} ${data.data.lastName}`,
        city: data.data.address.city,
        country: "Turkey",
        address: `${data.data.address.street} ${data.data.address.city} ${data.data.address.district}`,
      },
      basketItems: bill.items.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        itemType: item.itemType,
        price: item.price.toFixed(2),
      })),
    };
    const response = await iyzico.initialize3DS(paymentRequest);

    const temporary = await prisma.tempPayment.findUnique({
      where: {
        token: response.conversationId,
      },
    });
    if (!temporary) {
      return NextResponse.json(
        {
          status: 500,
          message:
            "Ödeme başlatılırken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
        },
        { status: 500 },
      );
    }
    if (response.status === "success" && response.threeDSHtmlContent) {
      const verify = generateIyzicoSignature("initialize", {
        paymentId: response.paymentId,
        conversationId: response.conversationId,
      });
      if (!verify) {
        return NextResponse.json(
          {
            status: 400,
            message:
              "Ödeme başlatılırken bir hata oluştu. Lütfen kart bilgilerinizi kontrol ediniz.",
          },
          { status: 400 },
        );
      }
      await prisma.tempPayment.update({
        where: {
          token: paymentSession.temp.token,
        },
        data: {
          paymentId: response.paymentId,
        },
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
      return NextResponse.json(
        {
          status: 400,
          message:
            "Ödeme başlatılırken bir hata oluştu. Lütfen kart bilgilerinizi kontrol ediniz.",
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        status: 500,
        message:
          "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
      },
      { status: 500 },
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
