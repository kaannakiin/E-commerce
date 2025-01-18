import { sendOrderCreatedEmail } from "@/actions/sendMailAction/SendMail";
import { findByPaymentIdAndUpdate } from "@/lib/İyzico/helper/helper";
import { rateLimiter } from "@/lib/rateLimitRedis";
import { NextRequest, NextResponse } from "next/server";
interface DataProps {
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
  iyzicoReferenceCode: string;
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
export async function POST(req: NextRequest) {
  try {
    const userIp =
      req.headers.get("x-real-userIp") ||
      req.headers.get("x-forwarded-for") ||
      "::1";
    // const rateLimit = await rateLimiter(userIp, {
    //   limit: 50,
    //   windowInMinutes: 30,
    // });
    // if (!rateLimit.success) {
    //   return NextResponse.json(
    //     {
    //       error: "Too many requests",
    //       reset: rateLimit.reset,
    //     },
    //     {
    //       status: 429,
    //       headers: {
    //         "X-RateLimit-Limit": rateLimit.limit.toString(),
    //         "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    //         "X-RateLimit-Reset": (rateLimit.reset || 0).toString(),
    //       },
    //     },
    //   );
    // }
    const data: DataProps = await req.json();
    if (
      data.status === "SUCCESS" &&
      (data.iyziEventType === "API_AUTH" ||
        data.iyziEventType === "THREE_DS_AUTH")
    ) {
      const paymentId = data.paymentId.toString();
      if (!paymentId) {
        return NextResponse.json({
          status: "error",
          message: "Payment Id boş olamaz",
        });
      }

      const updateOrder = await findByPaymentIdAndUpdate(paymentId.toString());
      if (!updateOrder.success) {
        return NextResponse.json({
          status: "error",
          message: updateOrder.message,
        });
      }
      const sendEmail = await sendOrderCreatedEmail({
        orderNumber: updateOrder.orderNumber,
        toEmail: updateOrder.email,
        products: updateOrder.product,
      });
      if (!sendEmail.success) {
        console.error("E-posta gönderim hatası:", {
          code: sendEmail.error?.code,
          message: sendEmail.error?.message,
          details: sendEmail.error?.details,
        });
      }
      return NextResponse.json({
        status: "success",
        message: "Sipariş başarıyla güncellendi",
      });
    }
    return NextResponse.json({
      status: "success",
      message: "Webhook received",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
