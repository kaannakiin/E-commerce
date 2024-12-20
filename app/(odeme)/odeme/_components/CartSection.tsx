"use client";
import ShoppingProduct from "@/components/ShoppingProduct";
import { useStore } from "@/store/store";
import { useMediaQuery } from "@mantine/hooks";
import { Accordion, Button, TextInput, UnstyledButton } from "@mantine/core";
import { MdShoppingCart } from "react-icons/md";
import DiscountCodeInput from "./DiscountCodeInput";
import { Fragment, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DiscountCheck } from "@/actions/user/discount-check";
import { formattedPrice } from "@/lib/format";

const CartSection = () => {
  const items = useStore((state) => state.items);
  const totalOriginalPrice = useStore((store) => store.totalOriginalPrice);
  const totalFinalPrice = useStore((store) => store.totalFinalPrice);
  const matches = useMediaQuery("(min-width: 56.25em)");
  const hasDiscount = totalOriginalPrice !== totalFinalPrice;
  const searchParams = useSearchParams();
  const [discountPrice, setDiscountPrice] = useState(0);
  const [discount, setDiscount] = useState({
    success: false,
  });
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const { push } = useRouter();
  useEffect(() => {
    const discountCode = searchParams.get("discountCode");
    async function applyDiscountCode() {
      if (!discountCode) return; // Eğer discountCode yoksa fonksiyonu çalıştırma

      await DiscountCheck(
        discountCode,
        items.map((item) => item.variantId),
      ).then((res) => {
        if (res.success) {
          setDiscount({ success: res.success });
          if (res.discountType === "FIXED") {
            setDiscountPrice(res.discountAmount);
            setDiscountMessage(res.message);
          } else {
            setDiscountPrice(totalFinalPrice * (res.discountAmount / 100));
            setDiscountMessage(res.message);
          }
        } else {
          setDiscountPrice(0);
          setDiscount({ success: false });
          const params = new URLSearchParams(searchParams);
          params.delete("discountCode");
          push(`?${params.toString()}`);
          setDiscountMessage(res.message);
        }
      });
    }
    applyDiscountCode();
  }, [searchParams, items, totalFinalPrice, push]);
  const CartContent = () => (
    <Fragment>
      <div className="sm:h-[calc(100vh-200px)] sm:overflow-auto lg:px-4 lg:py-8">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="rounded-lg bg-white/5 backdrop-blur-sm"
          >
            <ShoppingProduct item={item} />
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-800/80 p-5 backdrop-blur-sm md:absolute md:bottom-0 md:left-0">
        <div className="space-y-3 text-white">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Ara Toplam</span>
            <span>{formattedPrice(totalOriginalPrice)}</span>
          </div>{" "}
          <DiscountCodeInput
            success={discount.success}
            message={discountMessage}
          />
          {hasDiscount && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-400">İndirim</span>
              <span className="text-green-400">
                -{formattedPrice(totalOriginalPrice - totalFinalPrice)}
              </span>
            </div>
          )}
          {discountPrice > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-400">İndirim Kuponu Tutarı</span>
              <span className="text-green-400">
                -{formattedPrice(discountPrice)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-gray-600 pt-3">
            <span className="text-lg">Toplam</span>
            <span className="text-lg font-medium">
              {formattedPrice(totalFinalPrice - discountPrice)}
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  );

  if (!matches) {
    return (
      <Accordion
        defaultValue=""
        classNames={{
          chevron: "text-white font-bold",
        }}
      >
        <Accordion.Item value="cart">
          <Accordion.Control
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <MdShoppingCart size={22} className="text-white" />
              </div>
            }
            bg={"primary.9"}
            className="w-full items-center rounded-lg"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-white">Sepetim</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                  {items.length} ürün
                </span>
              </div>
            </div>
          </Accordion.Control>
          <Accordion.Panel>
            <CartContent />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  }

  return (
    <div className="sm:sticky sm:top-0 sm:h-screen sm:min-w-[420px] lg:min-w-[470px]">
      <div className="relative h-full">
        <CartContent />
      </div>
    </div>
  );
};

export default CartSection;
