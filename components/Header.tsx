import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Divider } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { IoMdHeartEmpty } from "react-icons/io";
import BurgerMenu from "./BurgerMenu";
import MenuCategory from "./MenuCategory";
import MenuUser from "./MenuUser";
import SearchSpotlight from "./SearchSpotlight";
import ShoppingIcon from "./ShoppingIcon";
import CustomImage from "./CustomImage";

const feedHeader = cache(async () => {
  try {
    const data = await prisma.category.findMany({
      where: {
        active: true,
      },
      select: {
        name: true,
        slug: true,
        products: {
          select: {
            name: true,
            Variant: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });

    // Önce variant'ları al
    const variants = await prisma.variant.findMany({
      where: {
        softDelete: false,
        isPublished: true,
        isSpotlightFeatured: true,
      },
      select: {
        slug: true,
        price: true,
        discount: true,
        unit: true,
        value: true,
        Image: {
          take: 1,
          select: {
            url: true,
          },
        },
        type: true,
        product: {
          select: {
            name: true,
            categories: {
              select: {
                slug: true,
              },
            },
            taxRate: true,
            shortDescription: true,
          },
        },
      },
      take: 10,
    });
    const salerInfo = await prisma.salerInfo.findFirst({
      select: {
        logo: {
          select: {
            url: true,
          },
        },
      },
    });
    const featuredProducts = variants.map((variant) => ({
      slug: variant.slug,
      product: {
        name: variant.product.name,
        shortDescription: variant.product.shortDescription,
        taxRate: variant.product.taxRate,
      },
      price: variant.price,
      discount: variant.discount || 0,
      type: variant.type,
      value: variant.value,
      Image: variant.Image,
    }));

    return {
      data,
      featuredProducts,
      salerInfo: salerInfo?.logo?.url,
    };
  } catch (error) {
    console.error("Header data fetch error:", error);
    return {
      data: [],
      featuredProducts: [],
    };
  }
});

const Header = async () => {
  const { featuredProducts, data, salerInfo } = await feedHeader();
  const session = await auth();
  const isUser = session?.user ? true : false;
  const favoritesUrl = isUser
    ? "/hesabim/favoriler"
    : "/giris?callbackUrl=/hesabim/favoriler";
  return (
    <header className="relative h-20 w-full">
      <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-2 lg:justify-between lg:px-10">
        {/* LEFT SECTION - Only visible on lg and up */}
        <div className="hidden w-1/3 flex-row items-center gap-4 lg:flex">
          {/* <Link
            className="group relative cursor-pointer text-black transition-all ease-in-out hover:text-blue-400"
            href={"/urunler"}
          >
            Tüm Ürünler
          </Link> */}
          <MenuCategory categories={data} />
        </div>

        <div className="flex h-full items-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <Link className="relative h-full w-52 sm:w-72" href="/">
            {salerInfo && (
              <CustomImage
                src={salerInfo}
                alt="logo Footer"
                sizes="100vw"
                objectFit="contain"
              />
            )}
          </Link>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-row items-center justify-end gap-1">
          <div className="flex items-center gap-1">
            <SearchSpotlight featuredProducts={featuredProducts} />
            <Link href={favoritesUrl}>
              <IoMdHeartEmpty
                size={28}
                className="hidden cursor-pointer lg:block"
              />
            </Link>
            <MenuUser isUser={isUser} />
            <ShoppingIcon />
          </div>
          <div className="lg:hidden">
            <BurgerMenu isUser={isUser} categories={data} />
          </div>
        </div>
      </div>
      <Divider size="sm" />
    </header>
  );
};

export default Header;
