import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { CategoryCarousels } from "./CategoryCarousels";
import { Prisma } from "@prisma/client";
export type FeedCategoriesType = Prisma.CategoryGetPayload<{
  where: {
    active: true;
    products: {
      some: {
        active: true;
        Variant: {
          some: {
            isPublished: true;
            softDelete: false;
          };
        };
      };
    };
  };
  orderBy: { createdAt: "asc" };
  select: {
    name: true;
    slug: true;
    description: true;
    images: {
      take: 1;
      select: {
        url: true;
      };
    };
  };
}>;
const feedCat = cache(async () => {
  try {
    return await prisma.category.findMany({
      where: {
        active: true,
        products: {
          some: {
            active: true,
            Variant: {
              some: {
                isPublished: true,
                softDelete: false,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
      select: {
        name: true,
        slug: true,
        description: true,
        images: {
          take: 1,
          select: {
            url: true,
          },
        },
      },
    });
  } catch (error) {
    return [];
  }
});
const FeedCategoryCarousels = async () => {
  const feedCategory = await feedCat();
  if (feedCategory.length === 0) return null;
  return (
    <div className="my-10 px-5">
      <CategoryCarousels categories={feedCategory} />
    </div>
  );
};

export default FeedCategoryCarousels;
