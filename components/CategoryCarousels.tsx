"use client";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { Paper, Text, Title, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import classes from "./modules/CategoryCarousels.module.css";
import { FeedCategoriesType } from "./FeedCategoryCarousels";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";

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
      radius="md"
      style={{ backgroundImage: `url(${image})` }}
      className={classes.card}
      component={Link}
      href={`/categories/${slug}`}
    >
      <div>
        <Text c={"secondary.9"} className={classes.category} size="xs">
          {category}
        </Text>
        <Title order={3} c={"secondary.9"} className={classes.title}>
          {title}
        </Title>
      </div>
    </Paper>
  );
}

export function CategoryCarousels({
  categories,
}: {
  categories: FeedCategoriesType[];
}) {
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
    data
      .filter((item) => item !== null)
      .map((item) => (
        <Carousel.Slide key={item.title}>
          <Card {...item} />
        </Carousel.Slide>
      ));

  return (
    <Carousel
      slideSize={{ base: "100%", sm: "25%" }}
      slideGap={{ base: 2, sm: "xl" }}
      align="start"
      slidesToScroll={mobile ? 1 : 4}
      previousControlIcon={<BiLeftArrowAlt size={16} />}
      nextControlIcon={<BiRightArrowAlt size={16} />}
      classNames={{
        control: "!rounded-none !border !border-black border-solid",
      }}
    >
      {slides}
    </Carousel>
  );
}
