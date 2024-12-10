// app/api/webhook/route.ts (App Router)
import {
  generateEmailTemplate,
  generateOrderConfirmationContent,
} from "@/lib/htmlTemplate";
import { isIyzicoIP } from "@/lib/IyzicoHelper";
import { createTransporter } from "@/lib/mailTransporter";
import { prisma } from "@/lib/prisma";
import { OrderStatus, paymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
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
export async function POST(req: NextRequest) {
  try {
    const body: Webhook = await req.json();
    const clientIP =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    if (!isIyzicoIP(clientIP)) {
      return NextResponse.json(
        { error: "Unauthorized request" },
        { status: 403 },
      );
    }
    switch (body.status) {
      case "CALLBACK_THREEDS":
        // 3D Secure doğrulaması tamamlandı, sonucu bekle
        return NextResponse.json(
          { message: "3D Secure callback received" },
          { status: 200 },
        );

      case "SUCCESS":
        try {
          const order = await prisma.order.update({
            where: {
              paymentId: body.paymentId.toString(),
            },
            data: {
              paymentStatus: paymentStatus.SUCCESS,
              orderStatus: OrderStatus.AWAITING_APPROVAL,
              paymentDate: new Date(),
            },
            include: {
              user: true,
              address: true,
              orderItems: {
                include: {
                  variant: {
                    include: {
                      product: true,
                      Image: true,
                    },
                  },
                },
              },
            },
          });

          const customTransporter = createTransporter({
            auth: {
              user: process.env.NO_REPLY_EMAIL!,
              pass: process.env.NO_REPLY_EMAIL_PASSWORD!,
            },
          });

          const emailContent = generateEmailTemplate({
            content: generateOrderConfirmationContent(
              order.paidPrice,
              order.orderNumber,
              order.orderItems.map((item) => ({
                name: item.variant.product.name,
                price: item.price,
                quantity: item.quantity,
                image:
                  item.variant.Image?.[0]?.url &&
                  `https://3b50-31-223-89-41.ngrok-free.app/api/user/asset/get-image?width=200&quality=80&url=${item.variant.Image[0].url}`,
              })),
            ),
          });

          try {
            await customTransporter.sendMail({
              from: process.env.NO_REPLY_EMAIL!,
              to: order.user?.email ?? order.address.email,
              subject: "Siparişiniz Oluşturuldu",
              html: emailContent,
            });
          } catch (error) {
            console.error("Error sending email:", error);
          }
        } catch (error) {
          return NextResponse.json(
            {
              status: 200,
              message: "Payment successful but failed to update database",
            },
            { status: 200 },
          );
        }
        return NextResponse.json(
          { message: "Payment successful" },
          { status: 200 },
        );

      case "FAILURE":
        try {
          await prisma.order.update({
            where: {
              paymentId: body.paymentId.toString(),
            },
            data: {
              paymentStatus: paymentStatus.FAILED,
            },
          });
          return NextResponse.json(
            { message: "Payment failed" },
            { status: 200 },
          );
        } catch (error) {
          return NextResponse.json(
            { message: "Payment failed" },
            { status: 200 },
          );
        }

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
