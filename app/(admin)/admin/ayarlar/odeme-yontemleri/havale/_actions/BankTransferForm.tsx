"use server";

import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
import {
  paymentMethodsForm,
  PaymentMethodsFormValues,
} from "@/zodschemas/authschema";
import { PaymentChannels } from "@prisma/client";

export async function BankTransferAction(
  data: PaymentMethodsFormValues,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz Erişim" };
    }

    const {
      description,

      maxAmount,
      minAmount,
      orderChange,
      orderChangeDiscountType,
      orderChangeType,
      testMode,
      title,
      type,
    } = paymentMethodsForm.parse(data);
    const payment = await prisma.paymentMethods.findUnique({
      where: {
        type: type as PaymentChannels,
      },
    });
    if (payment) {
      await prisma.paymentMethods.update({
        where: {
          id: payment.id,
        },
        data: {
          title,
          description,
          type: type as PaymentChannels,
          orderChange,
          orderChangeDiscountType,
          orderChangeType,
          maxAmount,
          minAmount,

          testMode,
        },
      });
      return { success: true, message: "Ödeme yöntemi başarıyla güncellendi" };
    } else {
      await prisma.paymentMethods.create({
        data: {
          title,
          description,
          type: type as PaymentChannels,
          maxAmount,
          minAmount,
          testMode,
          orderChange,
          orderChangeDiscountType,
          orderChangeType,
        },
      });
      return { success: true, message: "Ödeme yöntemi başarıyla eklendi" };
    }
  } catch (error) {
    return { success: false, message: "Bir hata oluştu" };
  }
}