import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import AuthUser from "./_components/AuthUser";
import CartSection from "./_components/CartSection";
import CheckoutForm from "./_components/CheckoutForm";
import AccordionForPayment from "./_components/AccordionForPayment";
export type Address = {
  addressDetail: string;
  addressTitle: string;
  city: string;
  district: string;
  id: string;
  name: string;
  phone: string;
  surname: string;
};
export type BankTransferDetailProps = Prisma.PaymentMethodsGetPayload<{
  select: {
    title: true;
    description: true;
    minAmount: true;
    maxAmount: true;
    orderChangeType: true;
    orderChange: true;
    orderChangeDiscountType: true;
  };
}>;
const feedPage = cache(async (userId: string | null | undefined) => {
  try {
    if (!userId) {
      const bankTransfer = await prisma.paymentMethods.findUnique({
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
          isFunctioning: true,
        },
      });
      return { bankTransfer, feedAddress: null };
    }

    // userId varsa tüm bilgileri getir
    const [bankTransfer, feedAddress] = await Promise.all([
      prisma.paymentMethods.findUnique({
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
          isFunctioning: true,
        },
      }),
      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          Adress: {
            select: {
              addressDetail: true,
              addressTitle: true,
              city: true,
              district: true,
              id: true,
              email: true,
              name: true,
              phone: true,
              surname: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),
    ]);

    return { bankTransfer, feedAddress };
  } catch (error) {
    console.error("Error in feedPage:", error);
    return { bankTransfer: null, feedAddress: null };
  }
});

export default async function CheckoutPage() {
  const session = await auth();
  const { bankTransfer, feedAddress } = await feedPage(session?.user?.id);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:gap-12 lg:gap-8">
          <div className="flex-1">
            <CartSection />
          </div>

          <div className="w-full md:sticky md:top-8 md:w-[600px]">
            {!session?.user ? (
              <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
                <AccordionForPayment data={bankTransfer} />
              </div>
            ) : (
              <AuthUser
                addresses={feedAddress.Adress}
                email={session.user.email}
                bankTransferData={bankTransfer}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
