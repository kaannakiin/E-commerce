"use client";
import ProductCard from "@/components/ProductCard";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { ProductTypeForCarousel } from "../[slug]/page";
import { Fragment } from "react";

const CategoryCarousel = ({
  products,
}: {
  products: ProductTypeForCarousel[];
}) => {
  if (products.length === 0) return null;
  return (
    <Fragment>
      <div className="px-4 lg:px-6">
        <p className="text-secondary-950 mb-4 py-4 text-2xl font-semibold sm:text-3xl">
          <span className="relative inline-block pb-2">Benzer Ürünlerimiz</span>
        </p>
      </div>
      <div className="relative w-full">
        <Carousel
          slideSize={{ base: "100%", xs: "50%", sm: "33.333333%", md: "25%" }}
          slideGap={{ base: 8, sm: 16 }}
          align="start"
          controlsOffset="xs"
          containScroll="trimSnaps"
          withControls={products.length > 4}
          classNames={{
            root: "px-4 lg:px-6",
            container: "cursor-grab active:cursor-grabbing",
          }}
          styles={{
            control: {
              "&[data-inactive]": {
                opacity: 0,
                cursor: "default",
              },
            },
            slide: {
              height: "100%",
            },
          }}
        >
          {products.map((product) => {
            const { isFavorite, ...productWithoutFavorite } = product;
            return (
              <Carousel.Slide key={product.id} className="h-full">
                <div className="mx-auto h-full max-w-[300px]">
                  <ProductCard
                    isFavorited={product.isFavorite}
                    product={productWithoutFavorite}
                  />
                </div>
              </Carousel.Slide>
            );
          })}
        </Carousel>
      </div>
    </Fragment>
  );
};

export default CategoryCarousel;
