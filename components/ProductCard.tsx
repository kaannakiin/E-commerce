"use client";
import { CategoryVariant } from "@/app/(kullanıcı)/(kategoriler)/[slug]/page";
import { AddFavorite } from "@/app/(kullanıcı)/(kategoriler)/_actions/ProductAction";
import CustomImage from "@/components/CustomImage";
import { calculatePrice } from "@/lib/calculatePrice";
import { formatPrice } from "@/lib/formatter";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { ActionIcon, ColorSwatch, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { VariantType } from "@prisma/client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { LiaTimesSolid } from "react-icons/lia";

const ProductCard = ({
  product,
  isFavorited = false,
}: {
  product: CategoryVariant;
  isFavorited: boolean;
}) => {
  const calculateTaxedPrice = calculatePrice(
    product.price,
    product.discount,
    product.product.taxRate,
  );

  const matches = useMediaQuery("(min-width: 56.25em)");
  const [isFave, setIsFave] = useState(isFavorited);
  const pathname = usePathname();
  const isInFavoritesPage = pathname === "/hesabim/favoriler";
  const onClickHeart = async (slug: string) => {
    await AddFavorite(product.id, slug).then(async (res) => {
      if (res.success) {
        setIsFave(!isFave);
      }
      if (res.isMustLogin) {
        await signIn(undefined, {
          redirectTo: `/${product.product.categories[0].slug}/${product.slug}`,
          redirect: true,
        });
      }
    });
  };
  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-500 hover:shadow-xl">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full">
        <Carousel
          withControls={product.Image.length > 1}
          align="start"
          loop
          styles={{
            root: { height: "100%" },
            viewport: { height: "100%" },
            container: { height: "100%" },
            slide: { height: "100%" },
          }}
          classNames={{
            controls: matches
              ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out top-1/2 -translate-y-1/2"
              : "top-1/2 -translate-y-1/2",
            control:
              "bg-white/80 backdrop-blur-sm hover:bg-white border-none shadow-md",
          }}
        >
          {product.Image.map((image, index) => (
            <Carousel.Slide key={index}>
              <div className="relative h-full w-full overflow-hidden">
                <div className="relative h-full w-full transform transition-transform duration-500 group-hover:scale-105">
                  <CustomImage
                    src={image.url}
                    quality={21}
                    priority={index === 0}
                    objectFit="contain"
                    alt={product.product.name}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>

        {/* Hover Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute left-4 top-4 z-20 rounded-xl bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            -%{calculateTaxedPrice.discount}
          </div>
        )}

        {/* Favorite Button */}
        <ActionIcon
          onClick={() =>
            onClickHeart(
              `/${product.product.categories[0].slug}/${product.slug}`,
            )
          }
          className={`absolute right-4 top-4 z-20 ${isInFavoritesPage ? "h-4 w-4" : "h-11 w-11"} rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white`}
        >
          {isInFavoritesPage ? (
            <LiaTimesSolid className="h-4 w-4 font-bold text-gray-700 transition-colors duration-300 hover:text-red-500" />
          ) : isFave ? (
            <FaHeart className="text-xl text-red-500" />
          ) : (
            <FaRegHeart className="text-xl text-gray-700 transition-colors duration-300 group-hover:text-red-500" />
          )}
        </ActionIcon>
      </div>

      {/* Product Info */}
      <Link
        href={`/${product.product.categories[0].slug}/${product.slug}`}
        className="flex flex-1 flex-col p-5 transition-all duration-300"
      >
        <div className="mb-2 flex items-center justify-between gap-4">
          <h3 className="text-md font-medium text-gray-900 group-hover:text-gray-700">
            {product.product.name}
          </h3>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-gray-500 group-hover:text-gray-600">
          {product.product.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-gray-900">
              {formatPrice(calculateTaxedPrice.finalPrice)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(calculateTaxedPrice.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
