"use server";

import { sendBankTransferConfirmedEmail } from "@/actions/sendMailAction/SendMail";
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
      select: { paymentType: true, status: true, user: true, address: true },
    });
    if (order.paymentType !== "BANK_TRANSFER" || order.status !== "PENDING") {
      return {
        success: false,
        message: "Bu sipariş havale ile ödenmemiş veya zaten onaylanmış",
      };
    } else {
      const updatedorder = await prisma.order.update({
        where: { orderNumber },
        data: {
          status: "PROCESSING",
          paymentDate: new Date(),
          paymentStatus: "SUCCESS",
        },
        include: {
          user: true,
          address: true,
          OrderItems: {
            include: {
              variant: {
                include: {
                  product: true,
                  Image: { select: { url: true }, take: 1 },
                },
              },
            },
          },
        },
      });

      const emailResult = await sendBankTransferConfirmedEmail({
        toEmail: updatedorder.user
          ? updatedorder.user.email
          : updatedorder.address.email,
        orderNumber,
        products: updatedorder.OrderItems.map((item) => ({
          name: item.variant.product.name,
          price: item.price,
          quantity: item.quantity,
          productImageUrl: item.variant.Image[0].url,
          type: item.variant.type,
          value: item.variant.value,
          unit: item.variant.unit,
        })),
      });

      if (!emailResult.success) {
        console.error("Email sending failed:", emailResult.error);
        return {
          success: false,
          message: "Havale onaylandı fakat email gönderilemedi",
        };
      }

      return { success: true, message: "Havale onaylandı" };
    }
  } catch (error) {
    return {
      success: false,
      message: "Bir hata oluştu. Lütfen tekrar deneyiniz.",
    };
  }
}
