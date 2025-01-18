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
        <p className="text-secondary-950 py-4 text-2xl font-semibold sm:text-3xl">
          <span className="relative inline-block pb-2">Benzer Ürünlerimiz</span>
        </p>
      </div>
      <Carousel
        slideSize={{ base: "100%", xs: "50%", sm: "33.333333%", md: "25%" }}
        slideGap={{ base: 8, sm: 10 }}
        align="start"
        draggable={false}
        withControls={products.length > 4}
        className="px-4 pb-6 lg:px-6"
      >
        {products.map((product) => {
          const { isFavorite, ...productWithoutFavorite } = product;
          return (
            <Carousel.Slide key={product.id} className="h-auto min-h-full">
              <ProductCard
                isFavorited={product.isFavorite}
                product={productWithoutFavorite}
              />
            </Carousel.Slide>
          );
        })}
      </Carousel>
    </Fragment>
  );
};

export default CategoryCarousel;
