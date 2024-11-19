import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { Divider } from "@mantine/core";
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Fragment>
      <header className="mx-auto flex h-20 w-full max-w-[1400px] flex-row justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex h-full items-center">
          <Link className="relative h-full w-52 sm:w-72" href="/">
            <Image
              src="/WELLNESSCLUBLOGO.svg"
              alt="Alt"
              fill
              sizes="100vw"
              className="h-full w-full object-contain"
            />
          </Link>
        </div>
        <Link href={"/sepet"} className="flex items-center justify-end">
          <HiOutlineShoppingBag size={30} />
        </Link>
      </header>
      <Divider size={"xs"} color="#1F2937" />
      <main>{children}</main>
    </Fragment>
  );
}
