import { prisma } from "@/lib/prisma";
import { isSameDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/lib/rateLimitRedis";

export async function POST(req: NextRequest) {
  try {
    // const ip =
    //   req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
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
    if (!data.paymentId || !data.orderItemId || !data.reason) {
      return NextResponse.json(
        {
          message: "Eksik bilgi gönderildi. Lütfen tüm alanları doldurun.",
          status: 400,
        },
        { status: 400 },
      );
    }

    // Sipariş kontrolü
    const order = await prisma.order.findUnique({
      where: {
        paymentId: data.paymentId,
      },
      select: {
        id: true,
        isCancelled: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        ip: true,
        cancelReason: true,
        OrderItems: {
          where: {
            id: data.orderItemId,
          },
          select: {
            id: true,
            refundStatus: true,
            refundAmount: true,
            refundPaymentId: true,
            refundReason: true,
            refundRequestDate: true,
            price: true,
            quantity: true,
            isRefunded: true,
          },
        },
      },
    });
    if (!order || order.OrderItems.length === 0) {
      return NextResponse.json(
        {
          message: "Sipariş bulunamadı.",
          status: 404,
        },
        { status: 404 },
      );
    }
    const sameDay = isSameDay(new Date(order.createdAt), new Date());
    const orderItem = order.OrderItems[0];

    if (
      order.isCancelled ||
      order.status !== "COMPLETED" ||
      order.paymentStatus !== "SUCCESS" ||
      sameDay ||
      order.cancelReason ||
      orderItem.isRefunded ||
      orderItem.refundStatus !== "NONE"
    ) {
      return NextResponse.json(
        {
          message: "Bu sipariş için iade talebi oluşturulamaz.",
          status: 400,
        },
        { status: 400 },
      );
    }
    const updatedOrder = await prisma.orderItems.update({
      where: {
        id: data.orderItemId,
      },
      data: {
        refundRequestDate: new Date(),
        refundReason: data.reason,
        refundStatus: "REQUESTED",
      },
    });

    if (!updatedOrder) {
      return NextResponse.json(
        {
          message: "İade talebi oluşturulurken bir hata oluştu.",
          status: 500,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "İade talebiniz başarıyla oluşturuldu.",
        status: 200,
        data: updatedOrder,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("İade talebi oluşturma hatası:", error);
    return NextResponse.json(
      {
        message:
          "İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        status: 500,
      },
      { status: 500 },
    );
  }
}
