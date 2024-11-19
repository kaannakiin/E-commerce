// app/api/webhook/route.ts (App Router)
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isIyzicoIP } from "@/lib/iyzicoIpCheck";
import { prisma } from "@/lib/prisma";
interface Webhook {
  paymentConversationId: string;
  merchantId: number;
  paymentId: number;
  status:
    | "FAILURE"
    | "SUCCESS"
    | "INIT_THREEDS"
    | "CALLBACK_THREEDS"
    | "BKM_POS_SELECTED"
    | "INIT_APM"
    | "INIT_BANK_TRANSFER"
    | "INIT_CREDIT"
    | "PENDING_CREDIT"
    | "INIT_CONTACTLESS";
  iyziReferenceCode: string;
  iyziEventType:
    | "CHECKOUT_FORM_AUTH"
    | "PAYMENT_API"
    | "API_AUTH"
    | "THREE_DS_AUTH"
    | "THREE_DS_CALLBACK"
    | "BANK_TRANSFER_AUTH"
    | "BKM_AUTH"
    | "BALANCE"
    | "CONTACTLESS_AUTH"
    | "CONTACTLESS_REFUND"
    | "CREDIT_PAYMENT_AUTH"
    | "CREDIT_PAYMENT_PENDING"
    | "CREDIT_PAYMENT_INIT"
    | "REFUND_RETRY_FAILURE"
    | "REFUND_RETRY_SUCCESS";
  iyziEventTime: number;
  iyziPaymentId: number;
}
export async function POST(request: Request) {
  try {
    const body: Webhook = await request.json();

    const headersList = await headers();

    const clientIP = headersList.get("x-forwarded-for");

    if (!isIyzicoIP(clientIP)) {
      return NextResponse.json(
        { error: "Unauthorized request" },
        { status: 403 },
      );
    }
    // 3D Secure işlem akışını yönet
    switch (body.status) {
      case "CALLBACK_THREEDS":
        // 3D Secure doğrulaması tamamlandı, sonucu bekle
        return NextResponse.json(
          { message: "3D Secure callback received" },
          { status: 200 },
        );

      case "SUCCESS":
        // Ödeme başarılı
        // Veritabanı güncelleme vs. işlemlerini yap
        try {
          await prisma.order.update({
            where: {
              paymentId: body.paymentId.toString(),
            },
            data: {
              orderStatus: "PROCESSING",
            },
          });
        } catch (error) {
          return NextResponse.json(
            {
              status: 200,
              message: "Payment successful but failed to update database",
            },
            { status: 200 },
          );
        }
        //send email here
        return NextResponse.json(
          { message: "Payment successful" },
          { status: 200 },
        );

      case "FAILURE":
        // Ödeme başarısız
        // Hata işleme kodlarınız
        return NextResponse.json(
          { message: "Payment failed" },
          { status: 200 }, // Bu durumda bile 200 dönmek daha uygun
        );

      default:
        return NextResponse.json(
          { message: `Status: ${body.status} received` },
          { status: 200 },
        );
    }
  } catch (error) {
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
