"use client";
import { AddFavorite } from "@/app/(admin)/admin/urunler/_actions/ProductActions";
import { CategoryVariant } from "@/app/(kullanici)/categories/[slug]/page";
import CustomImage from "@/components/CustomImage";
import { calculatePrice } from "@/lib/calculatePrice";
import { formattedPrice } from "@/lib/format";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import {
  ActionIcon,
  Button,
  Card,
  ColorSwatch,
  Paper,
  Text,
} from "@mantine/core";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { LiaTimesSolid } from "react-icons/lia";
import styles from "./modules/ProductCardCarousels.module.css";

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
    <Card radius="md" withBorder padding="xl" className="h-full">
      <Card.Section>
        <Carousel
          withIndicators={product.Image.length > 1}
          withControls={false}
          draggable={product.Image.length > 1}
          classNames={{
            indicator: styles.indicator,
          }}
          styles={{
            viewport: {
              overflow: "hidden",
            },
          }}
        >
          {product.Image.map((image, index) => (
            <Carousel.Slide key={index} h={350}>
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
      </Card.Section>

      <div className="mt-4 flex items-start justify-between gap-2">
        <Text fw={500} fz="lg" className="line-clamp-2 flex-1">
          {product.product.name}
        </Text>
        <div className="shrink-0">
          {product.type == "COLOR" && <ColorSwatch color={product.value} />}
          {product.type !== "COLOR" && (
            <Paper
              component={"span"}
              bg={"secondary.1"}
              c={"secondary.8"}
              className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-sm font-bold"
            >
              {product.type === "WEIGHT" && `${product.value} ${product.unit}`}
              {product.type === "SIZE" && `${product.value}`}
            </Paper>
          )}
        </div>
      </div>
      <Text fz="sm" c="dimmed" mt="sm" mb="sm" className="line-clamp-2">
        {product.product.shortDescription}
      </Text>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex flex-col items-center justify-start">
          {product.discount > 0 && (
            <Text span fz="sm" c="dimmed" td="line-through" ml={4}>
              {formattedPrice(calculateTaxedPrice.originalPrice)}
            </Text>
          )}
          <Text fz="md" span fw={700}>
            {formattedPrice(calculateTaxedPrice.finalPrice)}
          </Text>
        </div>

        <div className="flex items-center gap-2">
          {!isInHomePage && (
            <ActionIcon
              onClick={() => {
                const productSlug = product.slug;
                const path = productSlug ? `/${productSlug}` : "/";
                onClickHeart(path);
              }}
              variant={isFave ? "subtle" : "outline"}
              color="dark"
              autoContrast
              radius={"xs"}
            >
              {isInFavoritesPage ? (
                <LiaTimesSolid size={18} />
              ) : isFave ? (
                <FaHeart size={18} />
              ) : (
                <FaRegHeart size={18} />
              )}
            </ActionIcon>
          )}
          <Button
            component={Link}
            scroll={true}
            href={product.slug ? `/${product.slug}` : "/"}
            color="gray.9"
            radius={0}
            size="xs"
            variant="filled"
          >
            Sepete Ekle
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
