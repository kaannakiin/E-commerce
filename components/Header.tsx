import { Divider, Indicator } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoMdHeartEmpty } from "react-icons/io";
import SearchSpotlight from "./SearchSpotlight";
import BurgerMenu from "./BurgerMenu";
import MenuUser from "./MenuUser";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getFeaturedProducts } from "@/actions/user/get-featured-products";
import MenuCategory from "./MenuCategory";
import ShoppingIcon from "./ShoppingIcon";

const feedHeader = cache(async () => {
  try {
    const data = await prisma.category.findMany({
      where: {
        active: true,
      },
      select: {
        name: true,
        slug: true,
      },
    });
    const featuredProducts = await prisma.variant.findMany({
      where: {
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
            shortDescription: true,
          },
        },
      },
      take: 10,
    });
    return {
      data,
      featuredProducts,
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
  const { featuredProducts, data } = await feedHeader();

  return (
    <header className="relative h-20 w-full">
      <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-2 lg:justify-between lg:px-10">
        {/* LEFT SECTION - Only visible on lg and up */}
        <div className="hidden w-1/3 flex-row items-center gap-4 lg:flex">
          <MenuCategory categories={data} />
        </div>

        {/* CENTER SECTION - Logo */}
        <div className="flex h-full items-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
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

        {/* RIGHT SECTION */}
        <div className="flex flex-row items-center gap-2 lg:gap-5">
          <SearchSpotlight featuredProducts={featuredProducts} />
          <IoMdHeartEmpty
            size={28}
            className="hidden cursor-pointer lg:block"
          />
          <MenuUser />
          <ShoppingIcon />
          {/* Burger menu only visible on mobile */}
          <div className="lg:hidden">
            <BurgerMenu />
          </div>
        </div>
      </div>
      <Divider size="sm" />
    </header>
  );
};

export default Header;
