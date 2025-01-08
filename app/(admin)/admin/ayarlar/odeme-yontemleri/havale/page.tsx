import React, { cache } from "react";
import BankTransferForm from "./_components/BankTransferForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
export type BankTransferFormProps = Prisma.PaymentMethodsGetPayload<{
  select: {
    minAmount: true;
    maxAmount: true;
    description: true;
    title: true;
    orderChangeType: true;
    orderChange: true;
    orderChangeDiscountType: true;
  };
}>;
const feedPage = cache(async () => {
  try {
    const data = await prisma.paymentMethods.findUnique({
      where: { type: "transfer" },
      select: {
        minAmount: true,
        maxAmount: true,
        description: true,
        title: true,
        orderChangeType: true,
        orderChange: true,
        orderChangeDiscountType: true,
      },
    });
    if (!data) return null;
    return data;
  } catch (error) {
    return notFound();
  }
});
const BankTransferPage = async () => {
  const data = await feedPage();
  return (
    <div className="flex flex-col gap-4">
      <BankTransferForm data={data} />
    </div>
  );
};

export default BankTransferPage;
