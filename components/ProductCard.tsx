"use client";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { ColorSwatch } from "@mantine/core";
import CustomImage from "@/components/CustomImage";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";
import { formatPrice } from "@/lib/formatter";

const ProductCard = ({ product }) => {
  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;
  const matches = useMediaQuery("(min-width: 56.25em)");
  return (
    <div className="w-full flex flex-col gap-1">
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
            className="w-full aspect-[4.3/5] relative"
          >
            <CustomImage src={image.url} quality={21} />
          </Carousel.Slide>
        ))}
      </Carousel>
      <Link
        href={`/${product.product.categories[0].slug}/${product.slug}`}
        className="flex flex-col w-full mt-1 sm:mt-2"
      >
        <div className="w-full flex flex-row uppercase text-sm sm:text-lg md:text-xl font-thin items-center justify-between">
          <span>{product.product.name}</span>
          {product.type === "COLOR" && (
            <span>
              <ColorSwatch size="sm" color={product.value} />
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm sm:text-base md:text-lg">
            {formatPrice(discountedPrice)}
          </span>
          {product.discount > 0 && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              {formatPrice(product.price)}
            </span>
          )}
          {product.discount > 0 && (
            <span className="text-xs sm:text-sm text-red-500">
              -%{product.discount}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">
          {product.product.shortDescription}
        </p>
      </Link>
    </div>
  );
};

export default ProductCard;
