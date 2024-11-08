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
    <header className="h-20 w-full relative ">
      <div className="h-full max-w-[1920px] px-2 lg:px-10 mx-auto flex items-center justify-between lg:justify-between">
        {/* LEFT SECTION - Only visible on lg and up */}
        <div className="hidden lg:flex flex-row gap-4 items-center w-1/3">
          <MenuCategory categories={data} />
        </div>

        {/* CENTER SECTION - Logo */}
        <div className="flex items-center h-full lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <Link className="w-52 sm:w-72 h-full relative" href="/">
            <Image
              src="/WELLNESSCLUBLOGO.svg"
              alt="Alt"
              fill
              sizes="100vw"
              className="object-contain h-full w-full"
            />
          </Link>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-row gap-2 lg:gap-5 items-center">
          <SearchSpotlight featuredProducts={featuredProducts} />
          <IoMdHeartEmpty
            size={28}
            className="lg:block hidden cursor-pointer"
          />
          <MenuUser />
          <Indicator
            label="0"
            inline
            size={16}
            offset={2}
            radius="lg"
            classNames={{ indicator: "font-bold" }}
          >
            <HiOutlineShoppingBag className="cursor-pointer" size={28} />
          </Indicator>
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
