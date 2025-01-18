"use client";
import { formattedPrice } from "@/lib/format";
import { useStore } from "@/store/store";
import { Button, Card, Text, Title, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { RiShoppingBag2Line } from "react-icons/ri";
import ShoppingProduct from "./ShoppingProduct";

const CartPage = () => {
  const items = useStore((state) => state.items);
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const totalFinalPrice = useStore((state) => state.totalFinalPrice);
  if (items.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card
          className="flex w-full max-w-md flex-col items-center justify-center p-8 text-center"
          shadow="sm"
          radius="md"
        >
          <div className="mb-6 bg-gray-50 p-6">
            <RiShoppingBag2Line size={48} className="text-black" />
          </div>

          <Title order={2} className="mb-3 text-gray-800">
            Sepetiniz Boş
          </Title>

          <Text className="mb-8 text-gray-500">
            Ürünlerimizi keşfedin ve sepetinizi doldurmaya başlayın
          </Text>

          <Button
            component={Link}
            href="/tum-urunler"
            variant="filled"
            color="dark"
            radius="xs"
            size="lg"
            className="w-full max-w-[240px] transition-all duration-300 hover:opacity-90"
          >
            Alışverişe Başla
          </Button>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col gap-4 px-2 py-10 lg:px-10">
      <Title order={2}>Sepetim {`(${items.length})`}</Title>
      <div className="flex h-full w-full flex-col gap-3 lg:flex-row">
        <ul className="-my-6 divide-y divide-gray-200 lg:w-2/3" role="list">
          {items.map((item) => (
            <ShoppingProduct key={item.variantId} item={item} />
          ))}
        </ul>
        <Card
          bg={"gray.1"}
          m={0}
          radius={"xs"}
          className="-my-6 flex h-full w-full flex-1 flex-col gap-3"
        >
          <Title size={"h4"}>Toplam: {formattedPrice(totalFinalPrice)}</Title>
          <Button
            disabled={items.length === 0}
            fullWidth={mobile ? true : false}
            component={Link}
            href="/odeme"
            variant="filled"
            color="gray.9"
            radius={0}
          >
            {items.length === 0 ? "Sepetiniz Boş" : "Ödemeye Geç"}
          </Button>
        </Card>
      </div>
    </div>
  );
  // return (
  //   <div className="flex w-full items-start justify-center px-2 py-4 sm:px-4 sm:py-6 md:py-8">
  //     <div className="relative w-full max-w-6xl">
  //       <Card className="w-full">
  //         <div className="flex flex-col space-y-4">
  //           <h1 className="mb-6 text-2xl font-light sm:text-3xl">SEPET</h1>

  //           {items.length === 0 ? (
  //             <div className="flex h-40 flex-col items-center justify-center text-gray-500">
  //               <HiOutlineShoppingBag size={48} className="mb-4" />
  //               <p className="text-lg font-light">Sepetiniz boş</p>
  //               <Button
  //                 variant="outline"
  //                 className="mt-6"
  //                 component={Link}
  //                 href={"/tum-urunler"}
  //               >
  //                 Alışverişe Başla
  //               </Button>
  //             </div>
  //           ) : (
  //             <Fragment>
  //               <ul className="-my-6 divide-y divide-gray-200" role="list">
  //                 {items.map((item) => (
  //                   <ShoppingProduct key={item.variantId} item={item} />
  //                 ))}
  //               </ul>

  //               <div className="mt-auto space-y-3 font-sans">
  //                 <div className="flex items-center justify-between border-t border-gray-200 pt-3">
  //                   <Title size={"h2"} fw={700}>
  //                     Toplam
  //                   </Title>
  //                   <Text className="text-xl font-bold">
  //                     {formattedPrice(totalFinalPrice)}
  //                   </Text>
  //                 </div>
  //                 <Button
  //                   className="mt-4 h-12 text-base font-medium transition-all duration-200 hover:opacity-90"
  //                   disabled={items.length === 0}
  //                   fullWidth={mobile ? true : false}
  //                   component={Link}
  //                   href="/odeme"
  //                 >
  //                   {items.length === 0 ? "Sepetiniz Boş" : "Ödemeye Geç"}
  //                 </Button>
  //               </div>
  //             </Fragment>
  //           )}
  //         </div>
  //       </Card>
  //     </div>
  //   </div>
  // );
};

export default CartPage;
