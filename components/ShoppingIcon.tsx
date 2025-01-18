"use client";
import { formattedPrice } from "@/lib/format";
import { useStore } from "@/store/store";
import { Button, Drawer, Indicator, ScrollArea, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { usePathname, useRouter } from "next/navigation";
import React, { Fragment } from "react";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import ShoppingProduct from "./ShoppingProduct";

const CartDrawer = () => {
  const items = useStore((state) => state.items);
  const totalFinalPrice = useStore((state) => state.totalFinalPrice);
  const [open, setOpen] = React.useState(false);

  const mobile = useMediaQuery("(max-width: 768px)");

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
        size={mobile ? "100%" : "35%"}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <div className="flex h-full w-full flex-col p-5">
            <div className="flex h-fit w-full flex-row justify-between">
              <p className="text-xl font-semibold">
                SEPETİM {items.length === 0 ? null : `(${items.length})`}
              </p>
              <IoMdClose
                size={24}
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              />
            </div>
            <ScrollArea
              className="flex flex-1"
              type="scroll"
              scrollbarSize={2}
              scrollHideDelay={300}
            >
              <div className="mt-8 space-y-2 p-4">
                {items.length === 0 ? (
                  <div className="flex h-full w-full flex-col items-center justify-center p-8 text-gray-500">
                    <div className="relative mb-6 rounded-full bg-gray-50 p-6">
                      <HiOutlineShoppingBag
                        size={40}
                        className="animate-pulse text-black"
                      />
                    </div>
                    <h3 className="mb-2 text-xl font-medium text-gray-700">
                      Sepetiniz Boş
                    </h3>
                    <p className="mb-6 text-center text-sm text-gray-500">
                      Sepetinize ürün ekleyerek alışverişe başlayabilirsiniz
                    </p>
                    <button onClick={() => setOpen(false)}>
                      Alışverişe Başla
                    </button>
                  </div>
                ) : (
                  <ul className="-my-6 divide-y divide-gray-200" role="list">
                    {items.map((item) => (
                      <ShoppingProduct key={item.variantId} item={item} />
                    ))}
                  </ul>
                )}
              </div>
            </ScrollArea>
            <div className="space-y-2 border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <Text size="xl" fw={700}>
                  Toplam
                </Text>
                <Text fw={700} size="xl">
                  {formattedPrice(totalFinalPrice)}
                </Text>
              </div>

              <Button
                variant="filled"
                color={"black"}
                autoContrast
                radius={"xs"}
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
      ) : items.length === 0 ? (
        <HiOutlineShoppingBag
          className="cursor-pointer"
          size={28}
          onClick={handleIconClick}
        />
      ) : (
        <Indicator
          label={`${items.length}`}
          offset={2}
          size={"lg"}
          color="black"
          radius={"xl"}
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
