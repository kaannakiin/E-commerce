"use client";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { useMediaQuery } from "@mantine/hooks";
import {
  Paper,
  Text,
  Title,
  Button,
  useMantineTheme,
  rem,
} from "@mantine/core";
import classes from "./modules/CategoryCarousels.module.css";
import Link from "next/link";

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
      href={`/${slug}`}
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
  const data = categories.map((category) => ({
    image: "/api/user/asset/get-image?url=" + category.Image[0].url,
    title: category.name,
    category: category.description,
    slug: category.slug,
  }));
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const slides = data.map((item) => (
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
