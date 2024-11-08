"use client";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import {
  Badge,
  Card,
  CardSection,
  ColorSwatch,
  Group,
  Text,
} from "@mantine/core";
import { VariantType } from "@prisma/client";
import Link from "next/link";
import CustomImage from "./CustomImage";

const FeaturedProduct = ({ variant: product }) => {
  const slides = product.Image?.map((image) => (
    <CarouselSlide key={image.url} className="h-[300px] w-64  ">
      <CustomImage src={image.url || "/api/placeholder/320/256"} quality={21} />
    </CarouselSlide>
  ));

  const finalPrice =
    product.discount === 0
      ? product.price
      : (product.price - (product.price * product.discount) / 100).toFixed(0);

  return (
    <Card>
      <Link
        href={`/${product.product.categories[0].slug}/${product.slug}`}
        className="no-underline"
      >
        <CardSection>
          <Carousel
            withIndicators
            withControls={false}
            align="start"
            classNames={{
              indicator:
                "w-1 h-1 transition-all duration-500 bg-gray-400 data-[active]:bg-primary-500 data-[active]:w-4",
            }}
          >
            {slides}
          </Carousel>
        </CardSection>

        <Group className="w-full flex flex-col" gap={5}>
          <Text size="lg" fw={700} c="primary.8" className="w-full" mt={"xs"}>
            {product.product.name}
          </Text>
          <Group justify="space-between" className="w-full">
            {product.type == VariantType.COLOR && (
              <>
                <ColorSwatch size={28} color={product.value} />
              </>
            )}
            {product.type == VariantType.SIZE && (
              <>
                <Text size="md" fw={500}>
                  {product.value}
                </Text>
              </>
            )}
            {product.type == VariantType.WEIGHT && (
              <>
                <Text size="md" fw={500}>
                  {product.value} {product.unit}
                </Text>
              </>
            )}
            <div className="flex flex-row items-center gap-2">
              {" "}
              {product.discount > 0 && (
                <Text size="sm" td="line-through" c="dimmed">
                  {product.price.toFixed(2)} TL
                </Text>
              )}
              {product.discount > 0 && (
                <Badge color="red" variant="filled">
                  -%{product.discount.toFixed(0)}
                </Badge>
              )}
              <Text size="xl" fw={700} c="blue">
                {finalPrice} TL
              </Text>
            </div>
          </Group>
        </Group>
      </Link>
    </Card>
  );
};

export default FeaturedProduct;
