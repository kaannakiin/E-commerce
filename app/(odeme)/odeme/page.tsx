import React from "react";
import CartSection from "./_components/CartSection";
import CheckoutForm from "./_components/CheckoutForm";
import { auth } from "@/auth";
import AuthUser from "./_components/AuthUser";
import { prisma } from "@/lib/prisma";
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

export default async function CheckoutPage() {
  const session = await auth();
  let userAddresses: Address[] = [];
  if (session?.user) {
    const feedAddress = await prisma.user.findUnique({
      where: {
        id: session.user.id,
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
    });
    userAddresses = feedAddress?.Adress || [];
  }
  return (
    <div className="min-h-screen bg-white font-[sans-serif]">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:gap-12 lg:gap-8">
          <div className="flex-1">
            <CartSection />
          </div>

          <div className="w-full md:sticky md:top-8 md:w-[600px]">
            {!session?.user && (
              <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
                <CheckoutForm />
              </div>
            )}
            {session?.user && (
              <AuthUser addresses={userAddresses} email={session.user.email} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
