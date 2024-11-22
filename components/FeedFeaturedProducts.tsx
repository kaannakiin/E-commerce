import { prisma } from "@/lib/prisma";
import { cache } from "react";
import FeaturedProduct from "./FeaturedProducts";

// Cache'lenmiş veri çekme fonksiyonu
const feedFeaturedProduct = cache(async () => {
  try {
    const products = await prisma.variant.findMany({
      where: {
        isPublished: true,
        stock: {
          gt: 0, // Sadece stokta olan ürünleri getirir
        },
      },
      select: {
        id: true, // key prop için unique id eklendi
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
        product: {
          select: {
            name: true,
            description: true,
            taxRate: true,
            categories: {
              select: {
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
      return { error: "Gösterilecek ürün bulunamadı." };
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
  return (
    <section className="w-full px-5 py-8">
      <h2 className="mb-6 text-center text-2xl font-bold">En Çok Satanlar</h2>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {result.products &&
          result.products.map((product) => (
            <FeaturedProduct key={product.id} variant={product} />
          ))}
      </div>
    </section>
  );
};

export default FeedFeaturedProducts;
