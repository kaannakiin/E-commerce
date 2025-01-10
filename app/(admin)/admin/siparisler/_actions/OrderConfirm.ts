"use server";

import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";

export async function BankTransferConfirmAction(
  orderNumber: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz işlem" };
    }
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { paymentType: true, status: true },
    });
    if (order.paymentType !== "BANK_TRANSFER" || order.status !== "PENDING") {
      return {
        success: false,
        message: "Bu sipariş havale ile ödenmemiş veya zaten onaylanmış",
      };
    } else {
      await prisma.order.update({
        where: { orderNumber },
        data: {
          status: "PROCESSING",
          paymentDate: new Date(),
          paymentStatus: "SUCCESS",
        },
      });
      return { success: true, message: "Havale onaylandı" };
    }
  } catch (error) {
    return {
      success: false,
      message: "Bir hata oluştu. Lütfen tekrar deneyiniz.",
    };
  }
}
