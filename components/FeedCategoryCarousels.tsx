import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { CategoryCarousels } from "./CategoryCarousels";

const feedCat = cache(async () => {
  try {
    return await prisma.category.findMany({
      where: {
        active: true,
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
  return (
    <div className="my-10 h-[500px] px-5">
      <CategoryCarousels categories={feedCategory} />
    </div>
  );
};

export default FeedCategoryCarousels;
