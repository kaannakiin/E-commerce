"use server";
import { prisma } from "@/lib/prisma";

export const SearchProductForSpotlight = async (query: string) => {
  try {
    // Input validation
    if (!query || query.length < 2) {
      return {
        success: false,
        message: "Lütfen en az 2 karakter girin",
        data: [],
      };
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { shortDescription: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        name: true,
        shortDescription: true,
        taxRate: true,
        categories: {
          select: {
            slug: true,
          },
        },
        Variant: {
          where: {
            isPublished: true,
            stock: { gt: 0 },
          },
          select: {
            slug: true,
            price: true,
            type: true,
            unit: true,
            value: true,
            discount: true,
            Image: {
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
      },
      take: 7,
    });

    const productsWithVariants = products.filter(
      (product) => product.Variant.length > 0,
    );

    // Check if any products were found
    if (productsWithVariants.length === 0) {
      return {
        success: true,
        message: "Aramanızla eşleşen ürün bulunamadı",
        data: [],
      };
    }

    return {
      success: true,
      message: "Ürünler başarıyla getirildi",
      data: productsWithVariants,
    };
  } catch (error) {
    console.error("Arama hatası:", error);
    return {
      success: false,
      message: "Arama sırasında bir hata oluştu",
      data: [],
    };
  }
};
