"use client";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { ColorSwatch } from "@mantine/core";
import CustomImage from "@/components/CustomImage";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";
import { formatPrice } from "@/lib/formatter";
import { calculatePrice } from "@/lib/calculatePrice";

const ProductCard = ({ product }) => {
  const calculateTaxedPrice = calculatePrice(
    product.price,
    product.discount,
    product.product.taxRate,
  );
  const matches = useMediaQuery("(min-width: 56.25em)");
  return (
    <div className="flex w-full flex-col gap-1">
      <Carousel
        withControls={product.Image.length > 1}
        align={"start"}
        classNames={{
          root: "group",
          controls: matches
            ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out top-1/2 -translate-y-1/2"
            : "top-1/2 -translate-y-1/2",
        }}
      >
        {product.Image.map((image, index) => (
          <Carousel.Slide
            key={index}
            className="relative aspect-[4.3/5] w-full"
          >
            <CustomImage src={image.url} quality={21} />
          </Carousel.Slide>
        ))}
      </Carousel>
      <Link
        href={`/${product.product.categories[0].slug}/${product.slug}`}
        className="mt-1 flex w-full flex-col sm:mt-2"
      >
        <div className="flex w-full flex-row items-center justify-between text-sm font-thin uppercase sm:text-lg md:text-xl">
          <span>{product.product.name}</span>
          {product.type === "COLOR" && (
            <span>
              <ColorSwatch size="sm" color={product.value} />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base md:text-lg">
            {formatPrice(calculateTaxedPrice.finalPrice)}
          </span>
          {product.discount > 0 && (
            <span className="text-xs text-gray-500 line-through sm:text-sm">
              {formatPrice(calculateTaxedPrice.originalPrice)}
            </span>
          )}
          {product.discount > 0 && (
            <span className="text-xs text-red-500 sm:text-sm">
              -%{calculateTaxedPrice.discount}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-gray-600 sm:text-sm">
          {product.product.shortDescription}
        </p>
      </Link>
    </div>
  );
};

export default ProductCard;
