import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import {
  findAndRefundOrderItem,
  isWithinRefundPeriod,
} from "@/lib/İyzico/helper/helper";
import { iyzico } from "@/lib/İyzico/iyzicoClient";
import { prisma } from "@/lib/prisma";
import { createId } from "@paralleldrive/cuid2";
import { isSameDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, refundReason, orderItemsId } = await req.json();
    const isAdmin = await isAuthorized();
    if (!isAdmin) {
      return NextResponse.json(
        { status: 401, message: "Yetkisiz işlem" },
        { status: 401 },
      );
    }

    if (!paymentId || !refundReason)
      return NextResponse.json(
        {
          status: 400,
          message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        },
        { status: 400 },
      );
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
          status: 400,
          message: "Sipariş bulunamadı",
        },
        { status: 400 },
      );
    }
    if (
      order.isCancelled ||
      order.status !== "COMPLETED" ||
      order.paymentStatus !== "SUCCESS" ||
      isSameDay(order.paymentDate, new Date()) ||
      !isWithinRefundPeriod(order.paymentDate)
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Sipariş iptal edilemez.",
        },
        { status: 400 },
      );
    }

    const orderItem = order.OrderItems.find((item) => item.id === orderItemsId);
    if (!orderItem) {
      return NextResponse.json(
        {
          status: 400,
          message: "Sipariş bulunamadı",
        },
        { status: 400 },
      );
    }
    if (orderItem.isRefunded) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bu ürün iade edilmiş.",
        },
        { status: 400 },
      );
    }
    const requestData = {
      locale: "tr",
      ip: order.ip,
      price: orderItem.price,
      paymentTransactionId: orderItem.paymentTransactionId,
      conversationId: createId(),
    };
    const request = await iyzico.refundOrderItem(requestData);
    if (request.status === "failure") {
      return NextResponse.json(
        {
          status: 400,
          message: "Ürün iade edilemedi. Bizimle iletişeme geçebilirsiniz.",
        },
        { status: 400 },
      );
    }
    await findAndRefundOrderItem(orderItem.id, refundReason);
    return NextResponse.json(
      { status: 200, message: " İade talebiniz başarıyla oluşturuldu" },
      { status: 200 },
    );
  } catch (error) {}
}
