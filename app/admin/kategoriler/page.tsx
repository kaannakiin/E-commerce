import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import { cache } from "react";
import CategoryTable from "../AdminComponents/CategoryTable";

const feedCategories = cache(
  async ({
    search,
    take,
    skip,
  }: {
    search?: string;
    take: number;
    skip: number;
  }) => {
    try {
      const total = await prisma.category.count({
        where: {
          ...(search
            ? {
                name: { contains: search, mode: "insensitive" },
              }
            : {}),
        },
      });
      const cat = await prisma.category.findMany({
        where: {
          ...(search
            ? {
                OR: [{ name: { contains: search, mode: "insensitive" } }],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          active: true,
          createdAt: true,
          products: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // En yeni kategoriler önce gelsin
        },
        skip,
        take,
      });

      // Toplam sayfa sayısını hesaplayalım
      const totalPages = Math.ceil(total / take);

      return {
        data: cat,
        metadata: {
          total,
          totalPages,
          currentPage: Math.floor(skip / take) + 1,
          take,
        },
        message: "Success",
      };
    } catch (error) {
      return { error: error.message, data: [] };
    }
  }
);

const page = async (props: { params: Params; searchParams: SearchParams }) => {
  const params = await props.searchParams;
  const search = (params.search as string) || "";
  const page = parseInt(params.page as string, 10) || 1;

  const take = 10;

  const feedCat = await feedCategories({
    search,
    take,
    skip: (page - 1) * take,
  });

  return (
    <CategoryTable
      data={feedCat.data}
      totalPages={feedCat.metadata.totalPages}
    />
  );
};

export default page;
