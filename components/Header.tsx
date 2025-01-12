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
import { Prisma } from "@prisma/client";
export type SearchDefaultActionType = Prisma.VariantGetPayload<{
  select: {
    slug: true;
    price: true;
    discount: true;
    unit: true;
    value: true;
    Image: {
      select: {
        url: true;
      };
    };
    type: true;
    product: {
      select: {
        name: true;
        taxRate: true;
      };
    };
  };
}>;
const feedHeader = cache(async () => {
  try {
    const data = await prisma.category.findMany({
      where: {
        active: true,
        products: {
          some: {
            active: true,
            Variant: {
              some: {
                isPublished: true,
                softDelete: false,
              },
            },
          },
        },
      },
      select: {
        name: true,
        slug: true,
      },
    });
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
    const blogCount = await prisma.blog.findFirst({ where: { active: true } });

    const featuredProducts = variants.map((variant) => ({
      slug: variant.slug,
      product: {
        name: variant.product.name,
        taxRate: variant.product.taxRate,
      },
      price: variant.price,
      discount: variant.discount || 0,
      type: variant.type,
      value: variant.value,
      Image: variant.Image,
      unit: variant.unit,
    }));

    return {
      data,
      featuredProducts,
      salerInfo: salerInfo?.logo?.url,
      blogCount: blogCount ? true : false,
    };
  } catch (error) {
    console.error("Header data fetch error:", error);
    return {
      data: [],
      featuredProducts: [],
      salerInfo: null,
      blogCount: false,
    };
  }
});

const Header = async () => {
  const { featuredProducts, data, salerInfo, blogCount } = await feedHeader();
  const session = await auth();
  const isUser = session?.user ? true : false;
  const favoritesUrl = isUser
    ? "/hesabim/favoriler"
    : "/giris?callbackUrl=/hesabim/favoriler";
  return (
    <header className="relative h-24 w-full">
      <div className="mx-auto flex h-4 max-w-[1920px] items-center justify-end space-x-2 text-xs text-gray-500">
        <Link href={"/hakkimizda"}>Hakkımızda</Link>
        <Link href={"/iletisim"}>S.S.S</Link>
        <Link href={"/sikca-sorulan-sorular"}>İletisim</Link>
      </div>
      <div className="mx-auto flex h-20 max-w-[1920px] items-center justify-between px-2 lg:justify-between lg:px-10">
        <div className="hidden w-1/3 flex-row items-center gap-1 lg:flex">
          <MenuCategory
            MenuName="Tüm Ürünler"
            isDropDown={false}
            slug="/tum-urunler"
          />
          <MenuCategory MenuData={data} MenuName="Kategoriler" />
          {blogCount && (
            <MenuCategory MenuName="Blog" isDropDown={false} slug="/blog" />
          )}
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
            <BurgerMenu
              isUser={isUser}
              DropdownCategoryData={data}
              isHaveBlog={blogCount}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
