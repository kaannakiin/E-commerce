"use client";
import { AddFavorite } from "@/app/(admin)/admin/urunler/_actions/ProductActions";
import { CategoryVariant } from "@/app/(kullanici)/categories/[slug]/page";
import CustomImage from "@/components/CustomImage";
import { calculatePrice } from "@/lib/calculatePrice";
import { formattedPrice } from "@/lib/format";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { ActionIcon, Paper, Text, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
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
  const isInHomePage = pathname === "/";
  const onClickHeart = async (slug: string) => {
    await AddFavorite(product.id).then(async (res) => {
      if (res.success) {
        setIsFave(!isFave);
      }
      if (res.isMustLogin) {
        await signIn(undefined, {
          redirectTo: slug,
          redirect: true,
        });
      }
    });
  };
  return (
    <div className="group relative flex h-[450px] w-full flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 hover:shadow-lg sm:h-[500px] lg:h-[550px]">
      <div
        style={{
          backgroundColor: "var(--mantine-color-secondary-1)",
        }}
        className="relative h-[60%] w-full"
      >
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
              ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              : "",
            control:
              "bg-white/90 hover:bg-white border border-secondary-100 shadow-sm",
          }}
        >
          {product.Image.map((image, index) => (
            <Carousel.Slide key={index}>
              <div className="relative h-full w-full overflow-hidden">
                <CustomImage
                  src={image.url}
                  quality={80}
                  priority={index === 0}
                  objectFit="cover"
                  alt={product.product.name}
                />
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>

        <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">
          {product.discount > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              -%{calculateTaxedPrice.discount}
            </span>
          )}
        </div>

        {!isInHomePage && (
          <ActionIcon
            onClick={() => {
              const productSlug = product.slug;
              const path = productSlug ? `/${productSlug}` : "/";
              onClickHeart(path);
            }}
            size={"input-sm"}
            radius={"xl"}
            variant="transparent"
            className="absolute right-3 top-3 z-20 h-8 w-8 bg-white"
          >
            {isInFavoritesPage ? (
              <LiaTimesSolid
                style={{
                  height: "1rem",
                  width: "1rem",
                  color: "var(--mantine-color-gray-7)",
                }}
                className="transition-colors duration-200 hover:text-[var(--mantine-color-blue-5)]"
              />
            ) : isFave ? (
              <FaHeart
                style={{
                  fontSize: "1.5rem",
                  color: "var(--mantine-color-primary-5)",
                }}
              />
            ) : (
              <FaRegHeart
                style={{
                  fontSize: "1.5rem",
                  color: "var(--mantine-color-secondary-6)",
                  transition: "color 200ms",
                }}
                className="hover:text-[var(--mantine-color-primary-5)]" // hover için className kullanmak daha uygun
              />
            )}
          </ActionIcon>
        )}
      </div>

      <Link
        href={product.slug ? `/${product.slug}` : "/"}
        className="flex h-[40%] w-full flex-col p-4 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Title
            order={3}
            c={"secondary.8"}
            className="line-clamp-1 flex-1 text-base font-semibold"
          >
            {product.product.name.length > 20
              ? product.product.name.slice(0, 20) + "..."
              : product.product.name}
          </Title>
          {product.type === "COLOR" && (
            <span
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: product.value }}
            />
          )}
          {product.type !== "COLOR" && (
            <Paper
              component={"span"}
              bg={"secondary.1"}
              c={"secondary.8"}
              className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {product.type === "WEIGHT" && `${product.value}${product.unit}`}
              {product.type === "SIZE" && `${product.value}`}
            </Paper>
          )}
        </div>

        <p className="mt-1 line-clamp-2 h-[40px] text-sm">
          {product.product.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <Text c={"secondary-.8"} className="text-lg font-semibold">
              {formattedPrice(calculateTaxedPrice.finalPrice)}
            </Text>
            {product.discount > 0 && (
              <span className="-mt-1 text-xs font-medium text-red-500 line-through">
                {formattedPrice(calculateTaxedPrice.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
