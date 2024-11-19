import groupTransactionsByItemId from "@/lib/groupedTransactions";
import { iyzico } from "@/lib/iyzicoClient";
import { prisma } from "@/lib/prisma";
import { generateIyzicoSignature } from "@/lib/verifyIyzico";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token = req.nextUrl.searchParams.get("token") as string;
    const conversationId = formData.get("conversationId") as string;
    const paymentId = formData.get("paymentId") as string;
    const conversationData = formData.get("conversationData") as string;
    const status = formData.get("status") as string;
    const mdStatus = formData.get("mdStatus") as string;
    // Start transaction
    return await prisma.$transaction(async (tx) => {
      const temp = await tx.tempPayment.findUnique({
        where: { token },
        include: { address: true },
      });
      if (temp.expiresAt < new Date()) {
        await tx.tempPayment.delete({
          where: { token },
        });
        return Response.redirect(
          new URL(`/siparis/hata?message=sure-doldu`, req.nextUrl.origin),
        );
      }
      if (!temp) {
        return Response.redirect(
          new URL(`/siparis/hata?message=hata.`, req.nextUrl.origin),
        );
      }

      const response = await iyzico.create3DPayment({
        paymentId,
      });
      const paymentVerification = generateIyzicoSignature("auth", {
        paymentId: response.paymentId,
        currency: "TRY",
        basketId: response.basketId,
        //@ts-expect-error paidPrice is not in the type
        conversationId: response.conversationId || "",
        paidPrice: response.paidPrice,
        price: response.price,
      });
      if (!paymentVerification) {
        return Response.redirect(new URL(`/siparis/hata`, req.nextUrl.origin));
      }
      if (response.status === "success") {
        const items = groupTransactionsByItemId(response.itemTransactions);

        const order = await tx.order.create({
          data: {
            paymentId: response.paymentId,
            basketId: response.basketId,
            orderNumber: generateOrderNumber(),
            paidPrice: response.paidPrice,
            address: {
              connect: {
                id: temp.address.id,
              },
            },
            orderItems: {
              create: items.map((item) => ({
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.totalPrice,
                variant: {
                  connect: {
                    id: item.itemId,
                  },
                },
                currency: "TRY",
              })),
            },
          },
        });

        // Stok güncellemesi
        await Promise.all(
          items.map((item) =>
            tx.variant.update({
              where: { id: item.itemId },
              data: { stock: { decrement: item.quantity } },
            }),
          ),
        );
        await tx.tempPayment.delete({
          where: {
            token: token,
          },
        });
        return Response.redirect(
          new URL(
            `/siparis/basarili?orderNumber=${order.orderNumber}`,
            req.nextUrl.origin,
          ),
        );
      }
    });
  } catch (error) {
    return Response.redirect(new URL(`/siparis/hata`, req.nextUrl.origin));
  }
}

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Son 2 hane
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");

  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${year}${month}${day}${hour}${random}`;
}
