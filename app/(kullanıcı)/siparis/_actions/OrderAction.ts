"use server";
import { prisma } from "@/lib/prisma";
import {
  refundRequestSchema,
  RefundRequestValues,
} from "@/zodschemas/authschema";
import { differenceInDays } from "date-fns";
import { ZodError } from "zod";

export async function OrderReturn(data: RefundRequestValues): Promise<{
  status: boolean;
  message: string;
}> {
  try {
    const { info, orderId, description } = refundRequestSchema.parse(data);

    if (!orderId || !info) {
      return {
        status: false,
        message: "Bilgiler eksik",
      };
    }

    const existingRefundRequest =
      await prisma.refundOrderItemsRequest.findFirst({
        where: {
          orderItemId: orderId,
          status: {
            in: ["PENDING", "APPROVED"],
          },
        },
      });
    if (existingRefundRequest) {
      return {
        status: false,
        message: "Bu sipariş için zaten bir iade talebi var",
      };
    }
    const orderItem = await prisma.orderItems.findUnique({
      where: {
        id: orderId,
      },
      include: {
        order: {
          select: {
            ip: true,
            paymentId: true,
            orderStatus: true,
            paymentStatus: true,
            createdAt: true,
            deliveredDate: true,
          },
        },
      },
    });

    if (!orderItem) {
      return {
        status: false,
        message: "Sipariş bulunamadı",
      };
    }

    if (orderItem.order.paymentId === null) {
      return {
        status: false,
        message: "Ödeme bulunamadı",
      };
    }

    const deliveredItemsDate = new Date(orderItem.order.deliveredDate);
    const orderCreatedDate = new Date(orderItem.order.createdAt);
    const now = new Date();
    const isSameDay =
      orderCreatedDate.toISOString().split("T")[0] ===
      now.toISOString().split("T")[0];
    const isWithinFourteenDays =
      differenceInDays(now, deliveredItemsDate) <= 14;

    if (
      orderItem.order.paymentStatus === "SUCCESS" &&
      orderItem.order.orderStatus === "DELIVERED" &&
      orderItem.order.deliveredDate !== null &&
      !isSameDay &&
      isWithinFourteenDays
    ) {
      await prisma.refundOrderItemsRequest.create({
        data: {
          reason: info,
          orderItem: {
            connect: {
              id: orderId,
            },
          },
          refundReference: orderItem.order.paymentId,
          description: description,
        },
      });

      return {
        status: true,
        message: "İade talebi oluşturuldu",
      };
    }

    return {
      status: false,
      message: "İade talebi oluşturulamadı",
    };
  } catch (error) {
    console.error("Refund Request Error:", error);

    if (error instanceof ZodError) {
      return {
        status: false,
        message: error.errors[0].message,
      };
    }

    // Diğer tüm hatalar için genel bir hata mesajı
    return {
      status: false,
      message:
        "İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
    };
  }
}
