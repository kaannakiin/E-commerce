import React from "react";
import CustomImage from "./CustomImage";
import { formatPrice } from "@/lib/formatter";
import { CartVariant } from "@/store/useCartStore";
import { VariantType } from "@prisma/client";
import { ColorSwatch, ActionIcon, Group, Indicator } from "@mantine/core";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useStore } from "@/store/store";
import { usePathname } from "next/navigation";

const ShoppingProduct = ({ item }: { item: CartVariant }) => {
  const increaseQuantity = useStore((state) => state.increaseQuantity);
  const decreaseQuantity = useStore((state) => state.decreaseQuantity);
  const removeItem = useStore((state) => state.removeItem);
  const hasDiscount = item.priceCalculation.discount > 0;
  const pathname = usePathname();
  const isPaymentPage = pathname === "/odeme";

  const ImageComponent = () => (
    <>
      {isPaymentPage ? (
        <Indicator
          label={item.quantity}
          inline
          size={22}
          position="top-end"
          radius="xl"
          classNames={{ indicator: "font-bold", root: "relative h-48 w-full" }}
        >
          <CustomImage src={item.imageUrl} quality={21} />
        </Indicator>
      ) : (
        <div className="relative h-48 w-full">
          <CustomImage src={item.imageUrl} quality={21} />
        </div>
      )}
    </>
  );

  return (
    <div className="mb-6 grid grid-cols-12 gap-y-2 rounded-3xl border-2 border-gray-200 p-4 lg:p-6">
      <div className="col-span-12 lg:col-span-3">
        <ImageComponent />
      </div>
      <div className="col-span-12 w-full lg:col-span-9 lg:pl-3">
        <div className="mb-4 flex w-full items-center justify-between">
          <h5 className="font-manrope text-2xl font-bold leading-9 text-gray-900">
            {item.name}
          </h5>
          {!isPaymentPage && (
            <ActionIcon
              variant="subtle"
              color="red"
              className="rounded-full hover:bg-red-50"
              onClick={() => removeItem(item.variantId)}
            >
              <FaRegTrashCan size={20} />
            </ActionIcon>
          )}
        </div>
        <p className="mb-4 text-base font-normal leading-7 text-gray-500">
          {item.description}
        </p>
        <div className="mt-2">
          {item.type === VariantType.COLOR && (
            <ColorSwatch color={item.value} size={20} />
          )}
          {item.type === VariantType.SIZE && (
            <span className="rounded-md border px-3 py-1 text-sm">
              {item.value}
            </span>
          )}
          {item.type === VariantType.WEIGHT && (
            <span className="rounded-md border px-3 py-1 text-sm">
              {item.value} {item.unit}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          {!isPaymentPage && (
            <div className="flex items-center gap-4">
              <button
                className="flex items-center justify-center rounded-[50px] border border-gray-200 bg-white p-2.5 shadow-sm shadow-transparent transition-all duration-500 hover:border-gray-300 hover:bg-gray-50 hover:shadow-gray-200"
                onClick={() => decreaseQuantity(item.variantId)}
              >
                <FiMinus size={18} className="text-gray-900" />
              </button>
              <span className="w-10 rounded-full border border-gray-200 bg-gray-100 py-1.5 text-center text-sm font-semibold text-gray-900">
                {item.quantity}
              </span>
              <button
                className="flex items-center justify-center rounded-[50px] border border-gray-200 bg-white p-2.5 shadow-sm shadow-transparent transition-all duration-500 hover:border-gray-300 hover:bg-gray-50 hover:shadow-gray-200"
                onClick={() => increaseQuantity(item.variantId)}
              >
                <FiPlus size={18} className="text-gray-900" />
              </button>
            </div>
          )}
          <div className={`text-right ${isPaymentPage ? "ml-auto" : ""}`}>
            {hasDiscount && (
              <div className="mb-1 text-2xl text-gray-500 line-through">
                {formatPrice(
                  item.priceCalculation.originalPrice * item.quantity,
                )}
              </div>
            )}
            <h6 className="font-manrope text-2xl font-bold leading-9 text-primary-600">
              {formatPrice(item.priceCalculation.finalPrice * item.quantity)}
            </h6>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingProduct;
