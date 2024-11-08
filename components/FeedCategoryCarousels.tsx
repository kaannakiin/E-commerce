import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { CategoryCarousels } from "./CategoryCarousels";

const feedCat = cache(async () => {
  try {
    return await prisma.category.findMany({
      where: {
        active: true,
      },
      select: {
        name: true,
        slug: true,
        description: true,
        Image: {
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
    <div className="px-5 h-[500px] my-10 ">
      <CategoryCarousels categories={feedCategory} />
    </div>
  );
};

export default FeedCategoryCarousels;
