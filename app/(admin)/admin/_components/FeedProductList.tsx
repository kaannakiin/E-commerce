import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import { cache } from "react";
import TableProducts from "./TableProducts";
import { Prisma } from "@prisma/client";

type OrderByOption = "newest" | "oldest" | "price-high" | "price-low";

const products = cache(
  async (
    take: number,
    skip: number,
    orderBy: OrderByOption,
    search: string,
  ) => {
    const whereCondition: Prisma.VariantWhereInput = search
      ? {
          OR: [
            {
              product: {
                name: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
            },
            {
              value: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
          ],
        }
      : {};

    let orderByCondition: Prisma.VariantOrderByWithRelationInput = {};

    switch (orderBy) {
      case "newest":
        orderByCondition = { createdAt: "desc" };
        break;
      case "oldest":
        orderByCondition = { createdAt: "asc" };
        break;
      case "price-high":
        orderByCondition = { price: "desc" };
        break;
      case "price-low":
        orderByCondition = { price: "asc" };
        break;
      default:
        orderByCondition = { createdAt: "desc" };
    }

    const variantCount = await prisma.variant.count({
      where: whereCondition,
    });

    const variants = await prisma.variant.findMany({
      where: whereCondition,
      orderBy: orderByCondition,
      take: take,
      skip: skip,
      select: {
        id: true,
        price: true,
        unit: true,
        stock: true,
        type: true,
        slug: true,
        discount: true,
        value: true,
        createdAt: true,
        product: {
          select: {
            name: true,
            taxRate: true,
          },
        },
      },
    });

    return {
      variants,
      totalCount: variantCount,
    };
  },
);

const FeedProductList = async (props: {
  searchParams: SearchParams;
  params: Params;
}) => {
  const searchParams = await props.searchParams;
  const pageNumber = parseInt(searchParams.page as string, 10) || 1;
  const orderBy = (searchParams.sort as OrderByOption) || "newest";
  const search = (searchParams.search as string) || "";
  const take = 10;
  const skip = (pageNumber - 1) * take;

  const { variants, totalCount } = await products(take, skip, orderBy, search);

  const totalPages = Math.ceil(totalCount / take);

  return (
    <div>
      <TableProducts
        products={variants}
        totalPages={totalPages}
        currentPage={pageNumber}
      />
    </div>
  );
};

export default FeedProductList;
