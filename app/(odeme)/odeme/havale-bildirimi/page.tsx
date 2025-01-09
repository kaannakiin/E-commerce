import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";
import BankTransferAddressForm from "./_components/BankTransferAddressForm";
const feedPage = cache(async () => {
  try {
    const havale = await prisma.paymentMethods.findUnique({
      where: {
        type: "transfer",
      },
      select: {
        title: true,
        description: true,
        minAmount: true,
        maxAmount: true,
        orderChangeType: true,
        orderChange: true,
        orderChangeDiscountType: true,
      },
    });
    if (!havale) return notFound();
    return havale;
  } catch (error) {
    return notFound();
  }
});
const HavaleBildirimi = async () => {
  const data = await feedPage();
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:gap-12 lg:gap-8">
          <BankTransferAddressForm data={data} />
        </div>
      </div>
    </div>
  );
};

export default HavaleBildirimi;
