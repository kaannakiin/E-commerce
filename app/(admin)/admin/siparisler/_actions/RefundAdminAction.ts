"use server";

import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { iyzico } from "@/lib/iyzicoClient";
import {
  convertUnixToISOString,
  isSameDay,
  isWithinDays,
} from "@/lib/IyzicoHelper";
import { prisma } from "@/lib/prisma";
import { refundAdminSchema, RefundAdminValues } from "@/zodschemas/authschema";
import { createId } from "@paralleldrive/cuid2";

export async function ReturnAdminOrder(data: RefundAdminValues): Promise<{
  status: boolean;
  message: string;
}> {
  try {
    const isAdmin = await isAuthorized();
    if (!isAdmin)
      return {
        status: false,
        message: "Yetkili değilsiniz",
      };
    refundAdminSchema.parse(data);
    const item = await prisma.refundOrderItemsRequest.findUnique({
      where: { id: data.orderId },
      include: {
        orderItem: {
          include: {
            order: true,
          },
        },
      },
    });
    if (!item) {
      return { status: false, message: "İtem bulunamadı" };
    }

    if (data.quantity > item.orderItem.quantity) {
      return {
        status: false,
        message: "İade miktarı sipariş miktarından fazla olamaz",
      };
    }

    if (item.orderItem.refunded) {
      return { status: false, message: "Bu ürün daha önce iade edilmiş" };
    }
    if (
      item.orderItem.order.orderStatus !== "DELIVERED" ||
      item.orderItem.order.paymentStatus !== "SUCCESS"
    ) {
      return {
        status: false,
        message: "Sipariş iade için uygun durumda değil",
      };
    }

    const conversationId = createId();
    const refundRequest = await iyzico.refundPayment({
      ip: item.orderItem.order.ip,
      locale: "tr",
      conversationId,
      paymentId: item.refundReference,
      price: (item.orderItem.price * data.quantity).toFixed(2),
    });
    return await prisma.$transaction(async (tx) => {
      const conversationId = createId();
      const refundAmount = Number(
        (item.orderItem.price * data.quantity).toFixed(2),
      );

      // Minimum refund kontrolü
      if (refundAmount < 1) {
        return {
          status: false,
          message: "İade tutarı minimum limitin altında",
        };
      }

      const refundRequest = await iyzico.refundPayment({
        ip: item.orderItem.order.ip,
        locale: "tr",
        conversationId,
        paymentId: item.refundReference,
        price: refundAmount.toString(),
      });

      if (refundRequest.status !== "success") {
        return {
          status: false,
          message: refundRequest.errorMessage || "Ödeme iadesi başarısız",
        };
      }

      await tx.refundOrderItemsRequest.update({
        where: { id: data.orderId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewer: {
            connect: { id: isAdmin.id },
          },
          adminNote: data.adminNote,
          refundAmount: parseFloat(refundRequest.price),
          refundedAt: convertUnixToISOString(refundRequest.systemTime),
          orderItem: {
            update: {
              where: { id: item.orderItem.id },
              data: {
                refunded: true,
                refundDate: convertUnixToISOString(refundRequest.systemTime),
              },
            },
          },
        },
      });

      return {
        status: true,
        message: "İade işlemi başarıyla tamamlandı",
      };
    });
  } catch (error) {
    return {
      status: false,
      message: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin",
    };
  }
}
