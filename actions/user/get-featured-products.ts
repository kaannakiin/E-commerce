"use server";
import { prisma } from "@/lib/prisma";

export async function getFeaturedProducts() {
  try {
    const featuredVariants = await prisma.variant.findMany({
      where: {
        isPublished: true,
        isSpotlightFeatured: true,
      },
      select: {
        slug: true,
        price: true,
        discount: true,
        unit: true,
        value: true,
        Image: {
          take: 1,
          select: {
            url: true,
          },
        },
        type: true,
        product: {
          select: {
            name: true,
            shortDescription: true,
          },
        },
      },
      take: 10,
    });
    return featuredVariants;
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    return [];
  }
}
