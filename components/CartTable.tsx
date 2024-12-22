"use client";
import { formattedPrice } from "@/lib/format";
import { useStore } from "@/store/store";
import { Button, Card, ScrollArea, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Fragment } from "react";
import { HiOutlineShoppingBag } from "react-icons/hi";
import MainLoader from "./MainLoader";
import ShoppingProduct from "./ShoppingProduct";

const CartPage = () => {
  const { data: session, status } = useSession();
  const items = useStore((state) => state.items);
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const totalOriginalPrice = useStore((state) => state.totalOriginalPrice);
  const totalFinalPrice = useStore((state) => state.totalFinalPrice);

  const hasDiscount = totalOriginalPrice !== totalFinalPrice;

  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-gray-50 px-2 py-4 sm:px-4 sm:py-6 md:py-8">
      <div className="relative w-full max-w-6xl">
        <MainLoader />
        <Card
          className="w-full bg-white shadow-xl"
          style={{
            filter: status === "loading" ? "blur(2px)" : "none",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <div className="space-y-4 p-4 sm:p-6 md:p-8">
            <h1 className="mb-6 text-2xl font-light sm:text-3xl">SEPET</h1>

            {items.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-gray-500">
                <HiOutlineShoppingBag
                  size={48}
                  className="mb-4 text-primary-500"
                />
                <p className="text-lg font-light">Sepetiniz boş</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  component={Link}
                  href={"/"}
                >
                  Alışverişe Başla
                </Button>
              </div>
            ) : (
              <Fragment>
                <ScrollArea className="h-[350px] sm:h-[400px]">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <ShoppingProduct key={item.variantId} item={item} />
                    ))}
                  </div>
                </ScrollArea>

                <div className="mt-6 space-y-3 font-sans">
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-sm text-gray-600">Ara Toplam</span>
                    <span className="text-base font-medium">
                      {formattedPrice(totalOriginalPrice)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <Fragment>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-emerald-600">
                          İndirim Tutarı
                        </span>
                        <span className="text-base font-medium text-emerald-600">
                          -
                          {formattedPrice(totalOriginalPrice - totalFinalPrice)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                        <span className="text-base font-semibold">Toplam</span>
                        <span className="text-xl font-bold text-primary-600">
                          {formattedPrice(totalFinalPrice)}
                        </span>
                      </div>
                    </Fragment>
                  )}

                  {!hasDiscount && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                      <span className="text-base font-semibold">Toplam</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formattedPrice(totalOriginalPrice)}
                      </span>
                    </div>
                  )}
                  <Button
                    className="mt-4 h-12 text-base font-medium transition-all duration-200 hover:opacity-90"
                    disabled={items.length === 0}
                    fullWidth={mobile ? true : false}
                    component={Link}
                    href="/odeme"
                  >
                    {items.length === 0 ? "Sepetiniz Boş" : "Ödemeye Geç"}
                  </Button>
                </div>
              </Fragment>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CartPage;
