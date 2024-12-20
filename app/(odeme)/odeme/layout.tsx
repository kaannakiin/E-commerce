import { cache, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { Divider } from "@mantine/core";
import CustomImage from "@/components/CustomImage";
import { prisma } from "@/lib/prisma";
const feedPage = cache(async () => {
  const salerInfo = await prisma.salerInfo.findFirst({
    select: {
      logo: {
        select: {
          url: true,
        },
      },
    },
  });
  if (!salerInfo) return null;
  return salerInfo.logo?.url;
});
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const salerInfo = await feedPage();
  return (
    <Fragment>
      <header className="mx-auto flex h-20 w-full max-w-[1400px] flex-row justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex h-full items-center">
          {salerInfo && (
            <Link className="relative h-full w-52 sm:w-72" href="/">
              <CustomImage
                src={salerInfo}
                alt="logo Footer"
                sizes="100vw"
                objectFit="contain"
              />
            </Link>
          )}
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
