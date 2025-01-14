import { prisma } from "@/lib/prisma";
import { cache } from "react";
import ProductCard from "./ProductCard";
import { Paper } from "@mantine/core";

// Cache'lenmiş veri çekme fonksiyonu
const feedFeaturedProduct = cache(async () => {
  try {
    const products = await prisma.variant.findMany({
      where: {
        softDelete: false,
        isPublished: true,
        stock: {
          gt: 0,
        },
      },
      select: {
        id: true,
        Image: {
          select: {
            url: true,
          },
        },
        price: true,
        slug: true,
        stock: true,
        type: true,
        unit: true,
        value: true,
        discount: true,
        createdAt: true,

        product: {
          select: {
            name: true,
            description: true,
            shortDescription: true,
            taxRate: true,
            categories: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });

    if (!products.length) {
      return null;
    }
    return { products };
  } catch (error) {
    return {
      error:
        "Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
    };
  }
});

const FeedFeaturedProducts = async () => {
  const result = await feedFeaturedProduct();
  if (!result) return null;
  return (
    <Paper bg={"secondary.2"} className="w-full px-5 py-8">
      <h2 className="mb-6 text-center text-2xl font-bold">En Çok Satanlar</h2>
      <div className="grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {result.products.map((product) => (
          <ProductCard key={product.id} product={product} isFavorited={false} />
        ))}
      </div>
    </Paper>
  );
};

export default FeedFeaturedProducts;
