import React from "react";
import { AiOutlineHeart } from "react-icons/ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IdForEverythingType } from "@/zodschemas/authschema";
import { cache } from "react";
import ProductCard from "@/components/ProductCard";
import { Button, Paper, Text, Stack, Container, Flex } from "@mantine/core";
import Link from "next/link";

const feedPage = cache(async (id: IdForEverythingType) => {
  try {
    const favProducts = await prisma.user.findUnique({
      where: { id },
      select: {
        FavoriteVariants: {
          where: {
            deletedAt: null,
          },
          select: {
            variant: {
              select: {
                id: true,
                discount: true,
                price: true,
                value: true,
                type: true,
                unit: true,
                stock: true,
                createdAt: true,
                slug: true,
                Image: {
                  select: {
                    url: true,
                  },
                },
                product: {
                  select: {
                    name: true,
                    taxRate: true,
                    shortDescription: true,
                    categories: {
                      take: 1,
                      select: {
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return favProducts.FavoriteVariants;
  } catch (error) {
    return [];
  }
});

const EmptyFavorites = () => (
  <Container size="sm" p={0}>
    <Paper shadow="sm" radius="md" p="xl" withBorder className="min-h-[400px]">
      <Flex
        direction="column"
        align="center"
        justify="center"
        className="gap-6"
      >
        <AiOutlineHeart size={64} className="text-gray-300" />
        <Text size="xl" fw={600} className="text-center">
          Favori Ürününüz Bulunmuyor
        </Text>
        <Text color="dimmed" size="md" className="text-center" maw={400}>
          Beğendiğiniz ürünleri favori listenize ekleyerek daha sonra kolayca
          ulaşabilirsiniz.
        </Text>
        <Button
          component={Link}
          href="/"
          size="md"
          radius="md"
          variant="filled"
        >
          Alışverişe Başla
        </Button>
      </Flex>
    </Paper>
  </Container>
);

const Page = async () => {
  const session = await auth();
  const feed = await feedPage(session?.user?.id);

  if (!feed || feed.length === 0) {
    return <EmptyFavorites />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {feed.map((item) => (
        <ProductCard
          product={item.variant}
          isFavorited={true}
          key={item.variant.id}
        />
      ))}
    </div>
  );
};

export default Page;
