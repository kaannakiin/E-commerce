"use client";

import { Drawer, rem, TextInput } from "@mantine/core";
import Image from "next/image";
import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

const SearchDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IoSearchOutline
        size={28}
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      />
      <Drawer
        opened={open}
        onClose={() => setOpen(false)}
        position="right"
        size={rem(400)}
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        withCloseButton={false}
      >
        <div className="w-full h-full py-10 flex flex-col gap-10">
          <h1 className="text-center text-2xl">Ürün ara</h1>
          <div>
            <TextInput
              rightSection={
                <IoSearchOutline size={20} className="cursor-pointer" />
              }
              size="md"
              placeholder="Aramak istediğiniz ürünü yazınız"
            />
          </div>{" "}
          <h1 className="text-center mb-4 font-semibold text-2xl">
            Arama Sonuçları
          </h1>
          <div className="flex flex-col gap-4 w-full  ">
            <div className="flex flex-row gap-2">
              <div className="w-20 h-20 relative">
                <Image
                  src={"https://placehold.co/80x80/000000/FFFFFF.png"}
                  alt="deneme"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="flex-1 flex flex-col border border-black px-5">
                <p className="text-xl ">Ürün Adı</p>
                <p className="text-gray-500">100TL</p>
                <p className="text-gray-500">Variantlar</p>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-20 h-20 relative">
                <Image
                  src={"https://placehold.co/80x80/000000/FFFFFF.png"}
                  alt="deneme"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="flex-1 flex flex-col border border-black px-5">
                <p className="text-xl ">Ürün Adı</p>
                <p className="text-gray-500">100TL</p>
                <p className="text-gray-500">Variantlar</p>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-20 h-20 relative">
                <Image
                  src={"https://placehold.co/80x80/000000/FFFFFF.png"}
                  alt="deneme"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="flex-1 flex flex-col border border-black px-5">
                <p className="text-xl ">Ürün Adı</p>
                <p className="text-gray-500">100TL</p>
                <p className="text-gray-500">Variantlar</p>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-20 h-20 relative">
                <Image
                  src={"https://placehold.co/80x80/000000/FFFFFF.png"}
                  alt="deneme"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="flex-1 flex flex-col border border-black px-5">
                <p className="text-xl ">Ürün Adı</p>
                <p className="text-gray-500">100TL</p>
                <p className="text-gray-500">Variantlar</p>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-20 h-20 relative">
                <Image
                  src={"https://placehold.co/80x80/000000/FFFFFF.png"}
                  alt="deneme"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="flex-1 flex flex-col border border-black px-5">
                <p className="text-xl ">Ürün Adı</p>
                <p className="text-gray-500">100TL</p>
                <p className="text-gray-500">Variantlar</p>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-20 h-20 relative">
                <Image
                  src={"https://placehold.co/80x80/000000/FFFFFF.png"}
                  alt="deneme"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="flex-1 flex flex-col border border-black px-5">
                <p className="text-xl ">Ürün Adı</p>
                <p className="text-gray-500">100TL</p>
                <p className="text-gray-500">Variantlar</p>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-20 h-20 relative">
                <Image
                  src={"https://placehold.co/80x80/000000/FFFFFF.png"}
                  alt="deneme"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="flex-1 flex flex-col border border-black px-5">
                <p className="text-xl ">Ürün Adı</p>
                <p className="text-gray-500">100TL</p>
                <p className="text-gray-500">Variantlar</p>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-20 h-20 relative">
                <Image
                  src={"https://placehold.co/80x80/000000/FFFFFF.png"}
                  alt="deneme"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="flex-1 flex flex-col border border-black px-5">
                <p className="text-xl ">Ürün Adı</p>
                <p className="text-gray-500">100TL</p>
                <p className="text-gray-500">Variantlar</p>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-20 h-20 relative">
                <Image
                  src={"https://placehold.co/80x80/000000/FFFFFF.png"}
                  alt="deneme"
                  fill
                  sizes="100%"
                />
              </div>
              <div className="flex-1 flex flex-col border border-black px-5">
                <p className="text-xl ">Ürün Adı</p>
                <p className="text-gray-500">100TL</p>
                <p className="text-gray-500">Variantlar</p>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default SearchDrawer;
