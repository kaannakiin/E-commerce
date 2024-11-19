"use client";
import ShoppingProduct from "@/components/ShoppingProduct";
import { formatPrice } from "@/lib/formatter";
import { useStore } from "@/store/store";

const CartSection = () => {
  const items = useStore((state) => state.items);
  const totalOriginalPrice = useStore((store) => store.totalOriginalPrice);
  const totalFinalPrice = useStore((store) => store.totalFinalPrice);
  const totalDiscountAmount = useStore((store) => store.totalDiscountAmount);

  const hasDiscount = totalOriginalPrice !== totalFinalPrice;

  return (
    <div className="sm:sticky sm:top-0 sm:h-screen sm:min-w-[420px] lg:min-w-[470px]">
      <div className="relative h-full">
        <div className="px-4 py-8 sm:h-[calc(100vh-80px)] sm:overflow-auto">
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
              <span>{formatPrice(totalOriginalPrice)}</span>
            </div>

            {hasDiscount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">İndirim</span>
                <span className="text-green-400">
                  -{formatPrice(totalDiscountAmount)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-600 pt-3">
              <span className="text-lg">Toplam</span>
              <span className="text-lg font-medium">
                {formatPrice(totalFinalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSection;
