"use client";
import { useStore } from "@/store/store";
import { Button, Drawer, Indicator, ScrollArea, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { usePathname, useRouter } from "next/navigation";
import React, { Fragment } from "react";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import ShoppingProduct from "./ShoppingProduct";
import { formattedPrice } from "@/lib/format";

const CartDrawer = () => {
  const items = useStore((state) => state.items);
  const totalOriginalPrice = useStore((state) => state.totalOriginalPrice);
  const totalFinalPrice = useStore((state) => state.totalFinalPrice);
  const [open, setOpen] = React.useState(false);

  const mobile = useMediaQuery("(max-width: 768px)");
  const hasDiscount = totalOriginalPrice !== totalFinalPrice;

  const { push, refresh } = useRouter();
  const pathname = usePathname();
  const isCartPage = pathname === "/sepet";

  const handleIconClick = () => {
    if (isCartPage) {
      refresh();
    } else {
      setOpen((prev) => !prev);
    }
  };

  const handleDrawerButton = () => {
    setOpen(false);
    push("/sepet");
  };

  return (
    <Fragment>
      <Drawer.Root
        opened={open && !isCartPage}
        onClose={() => setOpen(false)}
        position="right"
        size={mobile ? "calc(100% - 40px)" : "35%"}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <div className="flex h-full w-full flex-col p-5">
            <div className="flex h-fit w-full flex-row justify-between">
              <p className="text-xl font-thin">SEPETİM</p>
              <IoMdClose
                size={24}
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              />
            </div>
            <ScrollArea
              className="flex flex-1"
              type="scroll"
              scrollbarSize={5}
              scrollHideDelay={300}
            >
              <div className="space-y-2 p-4">
                {items.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center text-gray-500">
                    <HiOutlineShoppingBag size={48} className="mb-2" />
                    <p className="text-center">Sepetiniz boş</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <ShoppingProduct key={item.variantId} item={item} />
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="space-y-2 border-t border-gray-200 p-4">
              {hasDiscount && (
                <div className="rounded-lg bg-green-50 p-3">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-base font-medium text-gray-600">
                      Toplam Fiyat
                    </span>
                    <span className="text-base text-gray-500 line-through">
                      {formattedPrice(totalOriginalPrice)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-gray-700">
                        İndirim
                      </span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      -{formattedPrice(totalOriginalPrice - totalFinalPrice)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Ödenecek Tutar</span>
                <Text c={"primary.6"} className="text-2xl font-bold">
                  {formattedPrice(totalFinalPrice)}
                </Text>
              </div>

              <Button
                className="bg-primary hover:bg-primary/90 h-12 text-lg font-medium text-white shadow-lg transition-colors hover:shadow-xl"
                disabled={items.length === 0}
                fullWidth
                onClick={handleDrawerButton}
              >
                {items.length === 0 ? "Sepetiniz Boş" : "Ödeme Yap"}
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {isCartPage ? (
        <HiOutlineShoppingBag size={28} onClick={handleIconClick} />
      ) : (
        <Indicator
          label={items.length}
          inline
          size={16}
          offset={2}
          radius="lg"
          classNames={{ indicator: "font-bold" }}
        >
          <HiOutlineShoppingBag
            className="cursor-pointer"
            size={28}
            onClick={handleIconClick}
          />
        </Indicator>
      )}
    </Fragment>
  );
};

export default CartDrawer;
