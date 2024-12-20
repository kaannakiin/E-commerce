import { isWithinRefundPeriod } from "@/lib/İyzico/helper/helper";
import { prisma } from "@/lib/prisma";
import { isSameDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { refundReason, orderItemsId } = await req.json();
    if (!refundReason || !orderItemsId) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        },
        { status: 400 },
      );
    }

    const orderItem = await prisma.orderItems.findUnique({
      where: {
        id: orderItemsId,
      },
      include: {
        order: true,
      },
    });
    if (!orderItem) {
      return NextResponse.json(
        {
          status: 400,
          message: "Sipariş bulunamadı",
        },
        { status: 400 },
      );
    }
    if (!orderItem.order) {
      return NextResponse.json(
        {
          status: 400,
          message: "Sipariş bulunamadı",
        },
        { status: 400 },
      );
    }
    if (
      orderItem.order.isCancelled ||
      orderItem.order.status !== "COMPLETED" ||
      orderItem.order.paymentStatus !== "SUCCESS" ||
      isSameDay(orderItem.order.paymentDate, new Date()) ||
      !isWithinRefundPeriod(orderItem.order.paymentDate)
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Sipariş iptal edilemez.",
        },
        { status: 400 },
      );
    }
    await prisma.orderItems.update({
      where: {
        id: orderItemsId,
      },
      data: {
        refundReason: refundReason,
        refundRequestDate: new Date(),
        refundStatus: "PROCESSING",
      },
    });
    return NextResponse.json(
      {
        status: 200,
        message: "İade talebiniz başarıyla oluşturuldu",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { status: 500, message: "Bilinmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}
