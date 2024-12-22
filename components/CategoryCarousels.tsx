"use client";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { Paper, rem, Text, Title, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import classes from "./modules/CategoryCarousels.module.css";

interface CardProps {
  image: string;
  title: string;
  category: string;
  slug: string;
}

function Card({ image, title, category, slug }: CardProps) {
  return (
    <Paper
      shadow="md"
      p="xl"
      component={Link}
      href={`/categories/${slug}`}
      style={{ backgroundImage: `url(${image})` }}
      className={classes.card}
    >
      <div>
        <Text className={classes.category} size="xs">
          {category}
        </Text>
        <Title order={3} className={classes.title}>
          {title}
        </Title>
      </div>
    </Paper>
  );
}

export function CategoryCarousels({ categories }) {
  const data =
    categories.length > 0 &&
    categories.map((category) => {
      const imageUrl =
        category.images?.[0]?.url &&
        "/api/user/asset/get-image?url=" + category.images[0].url;

      return {
        image: imageUrl,
        title: category.name ?? "İsimsiz Kategori",
        category: category.description ?? "Açıklama yok",
        slug: category.slug ?? "#",
      };
    });
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const slides =
    data &&
    data.map((item) => (
      <Carousel.Slide key={item.title}>
        <Card {...item} />
      </Carousel.Slide>
    ));

  return (
    <Carousel
      slideSize={{ base: "100%", sm: "33%" }}
      slideGap={{ base: rem(2), sm: "xl" }}
      align="start"
      loop
      slidesToScroll={mobile ? 1 : 3}
      withControls={mobile ? true : false}
      withIndicators={mobile ? false : true}
      classNames={{ indicator: classes.indicator }}
    >
      {slides}
    </Carousel>
  );
}
