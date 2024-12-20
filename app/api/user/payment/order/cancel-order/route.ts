import { findAndCancelOrder } from "@/lib/İyzico/helper/helper";
import { iyzico } from "@/lib/İyzico/iyzicoClient";
import { prisma } from "@/lib/prisma";
import { createId } from "@paralleldrive/cuid2";
import { CancelReason, OrderItems } from "@prisma/client";
import { isSameDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, cancelReason } = await req.json();
    const order = await prisma.order.findUnique({
      where: {
        paymentId,
      },
      include: {
        OrderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          status: 404,
          message: "Sipariş Bulunamadı",
        },
        { status: 404 },
      );
    }

    if (
      order.status !== "PROCESSING" ||
      order.paymentStatus !== "SUCCESS" ||
      !isSameDay(order.paymentDate, new Date()) ||
      order.OrderItems.length === 0 ||
      hasRefundedItems(order.OrderItems)
    ) {
      const errorDetails = {
        invalidStatus: {
          isError: order.status !== "PROCESSING",
          message: "Sipariş durumu iptal için uygun değil",
        },
        invalidPayment: {
          isError: order.paymentStatus !== "SUCCESS",
          message: "Ödeme durumu iptal için uygun değil",
        },
        notSameDay: {
          isError: !isSameDay(order.paymentDate, new Date()),
          message: "Sipariş sadece oluşturulduğu gün iptal edilebilir",
        },
        emptyOrder: {
          isError: order.OrderItems.length === 0,
          message: "Boş sipariş iptal edilemez",
        },
        hasRefunds: {
          isError: hasRefundedItems(order.OrderItems),
          message:
            "İade işlemi başlatılmış ürünler bulunan sipariş iptal edilemez",
        },
      };
      const firstError = Object.values(errorDetails).find(
        (detail) => detail.isError,
      );
      return NextResponse.json(
        {
          status: 400,
          message: firstError?.message || "Bu sipariş iptal edilemez",
        },
        { status: 400 },
      );
    }

    const cancelRequest = {
      locale: "tr",
      paymentId: order.paymentId,
      ip: order.ip,
      conversationId: createId(),
    };
    const request = await iyzico.cancelOrder(cancelRequest);
    if (
      request.status === "failure" ||
      request.conversationId !== cancelRequest.conversationId
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Sipariş iptal edilemedi",
        },
        { status: 400 },
      );
    }
    const result = await findAndCancelOrder(
      order.paymentId,
      request.cancelHostReference,
      cancelReason as CancelReason,
    );

    if (!result) {
      return NextResponse.json(
        {
          status: 404,
          message: "Sipariş iptal edilemedi",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        status: 200,
        message: "Sipariş başarıyla iptal edildi",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Sipariş iptal hatası:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Sipariş iptal edilirken bir hata oluştu",
      },
      { status: 500 },
    );
  }
}

const hasRefundedItems = (orderItems: OrderItems[]) => {
  return orderItems.some(
    (item) =>
      item.isRefunded ||
      (item.refundStatus &&
        item.refundStatus !== "NONE" &&
        item.refundStatus !== "REJECTED"),
  );
};
