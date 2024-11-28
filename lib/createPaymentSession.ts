import { createId } from "@paralleldrive/cuid2";
import { prisma } from "./prisma";

export async function createPaymentSession(data, bill, discountCode) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const temp = await tx.tempPayment.create({
        data: {
          basketId: createId(),
          paidPrice: parseFloat(
            bill.items
              .reduce((total, item) => total + item.price, 0)
              .toFixed(2),
          ),
          token: createId(),
          ...(discountCode && { discountCode }),
          discountCodePrice: bill.discountAmount,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          address: {
            create: {
              name: data.data.firstName + " " + data.data.lastName,
              phone: data.data.phone,
              email: data.data.email,
              addressDetail: data.data.address.street,
              city: data.data.address.city,
              district: data.data.address.district,
            },
          },
        },
      });
      return { temp };
    });
    return result;
  } catch (error) {
    console.error("Payment session creation failed:", error);
    throw new Error("Payment session creation failed");
  }
}
