import { iyzico } from "@/lib/İyzico/iyzicoClient";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/rateLimitRedis";
import { createId } from "@paralleldrive/cuid2";
import { isSameDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    // const rateLimit = await rateLimiter(ip, {
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
    const data = await req.json();
    if (!data.paymentId || !data.cancelReason || !data.ip) {
      return NextResponse.json(
        {
          message: "Missing required fields",
          status: 400,
        },
        { status: 400 },
      );
    }
    const order = await prisma.order.findUnique({
      where: {
        paymentId: data.paymentId,
      },
      select: {
        createdAt: true,
        paymentStatus: true,
        status: true,
        isCancelled: true,
      },
    });
    const orderSameDay = isSameDay(new Date(order.createdAt), new Date());
    if (
      !order ||
      order.isCancelled ||
      !orderSameDay ||
      order.status === "CANCELLED" ||
      order.paymentStatus !== "SUCCESS" ||
      order.status === "COMPLETED" ||
      order.status === "SHIPPED"
    ) {
      return NextResponse.json(
        {
          message: "Sipariş iptal edilemez.",
          status: 400,
        },
        { status: 400 },
      );
    }
    const conversationId = createId();

    const request = await iyzico.cancelOrder({
      paymentId: data.paymentId,
      ip: data.ip,
      conversationId,
      locale: "tr",
    });
    if (
      request.status === "failure" ||
      request.conversationId !== conversationId
    ) {
      return NextResponse.json(
        {
          message:
            "Sipariş iptal edilemiyor. Lütfen bizimle iletişime geçiniz.",
          status: 400,
        },
        { status: 400 },
      );
    } else {
      await prisma.order.update({
        where: {
          paymentId: data.paymentId,
        },
        data: {
          isCancelled: true,
          cancelReason: data.cancelReason,
          cancelProcessDate: new Date(),
          cancelPaymentId: request.paymentId,
          paymentStatus: "REFUND",
          status: "CANCELLED",
        },
      });
      return NextResponse.json(
        { message: "Başarıyla iade edildi", status: 200 },
        { status: 200 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Bilinmeyen bir hata oluştu lütfen tekrar deneyiniz.",
        status: 500,
      },
      { status: 500 },
    );
  }
}
