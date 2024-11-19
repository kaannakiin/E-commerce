import React from "react";
import CartSection from "./_components/CartSection";
import CheckoutForm from "./_components/CheckoutForm";
import { auth } from "@/auth";

export default async function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white font-[sans-serif]">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          {/* Sol taraf - Sepet */}
          <div className="flex-1">
            <CartSection />
          </div>

          {/* Sağ taraf - Checkout Formu */}
          <div className="w-full md:sticky md:top-8 md:w-[600px]">
            <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
              <CheckoutForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
