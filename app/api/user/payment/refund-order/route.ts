import {
  generateEmailTemplate,
  generateRefundEmailContent,
} from "@/lib/htmlTemplate";
import { iyzico } from "@/lib/iyzicoClient";
import { createTransporter } from "@/lib/mailTransporter";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/rateLimitRedis";
import { refundFormSchema } from "@/zodschemas/authschema";
import { createId } from "@paralleldrive/cuid2";
import { OrderStatus, paymentStatus } from "@prisma/client";
import { addHours, format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    const canProceed = await rateLimiter(ip);
    if (!canProceed.success) {
      return NextResponse.json(
        { message: "Rate limit exceeded" },
        { status: 429 },
      );
    }
    const data = await req.json();

    if (!data.paymentId || !data.ip) {
      return NextResponse.json(
        {
          status: 400,
          message: "Hatalı istek",
        },
        {
          status: 400,
        },
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        paymentId: data.paymentId,
      },
    });

    if (!order || order.paymentId !== data.paymentId || order.ip !== data.ip) {
      return NextResponse.json(
        {
          status: 400,
          message: "Sipariş bulunamadı",
        },
        {
          status: 400,
        },
      );
    }
    const cancelableStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.AWAITING_APPROVAL,
      OrderStatus.PROCESSING,
    ];
    if (
      !cancelableStatuses.includes(order.orderStatus) ||
      order.paymentStatus === paymentStatus.REFUNDED
    ) {
      return NextResponse.json(
        { message: "Bu sipariş iptal edilemez" },
        { status: 400 },
      );
    }
    const CANCELLATION_REASONS = [
      { value: "wrong_product", label: "Yanlış ürün seçimi" },
      { value: "better_price", label: "Daha uygun fiyat buldum" },
      { value: "delivery_time", label: "Teslimat süresi uzun" },
      { value: "changed_mind", label: "Fikrim değişti" },
      { value: "financial", label: "Finansal nedenler" },
      { value: "other", label: "Diğer" },
    ];
    const { info } = refundFormSchema.parse({ info: data.reason });
    const reason = CANCELLATION_REASONS.find((reason) => reason.value === info);
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const isSameDay =
      orderDate.toISOString().split("T")[0] === now.toISOString().split("T")[0];
    if (!isSameDay) {
      return NextResponse.json(
        {
          status: 400,
          message: "You can only refund orders on the same day",
        },
        {
          status: 400,
        },
      );
    }
    const request = await iyzico.cancelPayment({
      paymentId: data.paymentId,
      ip: data.ip,
      conversationId: createId(),
      locale: "tr",
    });

    if (request.status === "failure") {
      return NextResponse.json(
        {
          status: 400,
          message: request.errorMessage,
        },
        {
          status: 400,
        },
      );
    }
    if (request.status === "success") {
      try {
        const order = await prisma.$transaction(async (tx) => {
          const order = await tx.order.update({
            where: {
              paymentId: request.paymentId,
            },
            data: {
              paymentStatus: paymentStatus.REFUNDED,
              orderStatus: OrderStatus.CANCELLED,
              cancelledAt: new Date(),
              cancelReason: reason?.label,
            },
            include: {
              orderItems: true,
              user: true,
              address: true,
            },
          });
          await tx.orderItems.updateMany({
            where: {
              orderId: order.id,
            },
            data: {
              refunded: true,
              refundDate: new Date(),
            },
          });
          await Promise.all(
            order.orderItems.map((item) =>
              tx.variant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              }),
            ),
          );
          return order;
        });
        const customTransporter = createTransporter({
          auth: {
            user: process.env.NO_REPLY_EMAIL!,
            pass: process.env.NO_REPLY_EMAIL_PASSWORD!,
          },
        });
        const sendMail = async (transporter: nodemailer.Transporter) => {
          const emailContent = generateEmailTemplate({
            content: generateRefundEmailContent(
              order.paidPrice,
              order.orderNumber,
            ),
          });
          await transporter.sendMail({
            from: process.env.NO_REPLY_EMAIL!,
            to: order.user?.email ?? order.address.email,
            subject: "Sipariş İadesi",
            html: emailContent,
          });
        };
        await sendMail(customTransporter);
        return NextResponse.json({
          status: 200,
          message: "Sipariş iade edildi",
        });
      } catch (error) {
        return NextResponse.json(
          { message: "İade işlemi sırasında bir hata oluştu" },
          { status: 500 },
        );
      }
    }
  } catch (error) {
    console.log(error);
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
}
