"use server";

import { prisma } from "@/lib/prisma";

export async function GetAddresById(id: string) {
  try {
    if (!id) return null;
    const address = await prisma.address.findUnique({
      where: { id, isDeleted: false, temporary: false },
      select: {
        addressDetail: true,
        email: true,
        district: true,
        city: true,
        name: true,
        surname: true,
        phone: true,
      },
    });
    return address;
  } catch (error) {
    return null;
  }
}
export async function OrderNumberCheck(
  orderNumber: string,
): Promise<{ success: boolean }> {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber, paymentType: "BANK_TRANSFER" },
    });
    if (!order) return { success: false };
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
