"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function confirmOrder(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!id) {
      return {
        success: false,
        message: "Sipariş numarası boş olamaz",
      };
    }
    const order = await prisma.order.findUnique({
      where: {
        id: id,
      },
    });

    if (!order) {
      return {
        success: false,
        message: "Sipariş numarası boş olamaz",
      };
    }
    if (order.paymentStatus !== "SUCCESS") {
      return {
        success: false,
        message: "Ödeme başarısız, sipariş onaylanamaz",
      };
    }
    if (
      order.orderStatus === "AWAITING_APPROVAL" &&
      order.paymentStatus === "SUCCESS"
    ) {
      await prisma.order.update({
        where: {
          id: id,
        },
        data: {
          orderStatus: OrderStatus.PROCESSING,
        },
      });
      return {
        success: true,
        message: "Sipariş onaylandı",
      };
    }
    return {
      success: false,
      message: "Sipariş zaten onaylandı",
    };
  } catch (error) {
    return error;
  }
}
