import { cache } from "react";
import { TableSelection } from "./_components/TableProduct";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import TableSearch from "./_components/TableSearch";
import { SearchParams } from "@/types/types";
import SpecialPagination from "@/components/Pagination";
import { Button } from "@mantine/core";
import Link from "next/link";

export type Status = "all" | "active" | "inactive";
export type Products = Prisma.ProductGetPayload<{
  select: {
    id: true;
    _count: { select: { Variant: true } };
    Variant: {
      select: {
        slug: true;
        Image: { select: { url: true } };
      };
    };
    active: true;
    name: true;
  };
}>[];

type WhereClause = {
  OR?: { name: { contains: string; mode: "insensitive" } }[];
  active?: boolean;
};

const feedPage = cache(
  async ({
    search,
    status,
    sort,
    page,
  }: {
    search?: string;
    status?: Status;
    sort?: string;
    page?: number;
  }) => {
    const take = 10;
    const skip = ((page || 1) - 1) * take;

    const where: WhereClause = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }

    if (status && status !== "all") {
      where.active = status === "active";
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sort) {
      case "oldest":
        orderBy.createdAt = "asc";
        break;
      case "name_asc":
        orderBy.name = "asc";
        break;
      case "name_desc":
        orderBy.name = "desc";
        break;
      case "newest":
      default:
        orderBy.createdAt = "desc";
    }

    const [total, product] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        take,
        skip,
        select: {
          id: true,
          _count: {
            select: {
              Variant: { where: { softDelete: false } },
            },
          },
          Variant: {
            where: { softDelete: false },
            select: {
              slug: true,
              Image: { select: { url: true } },
            },
          },
          active: true,
          name: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    return { product, totalPages };
  },
);

const ProductPage = async (params: { searchParams: SearchParams }) => {
  const searchParams = await params.searchParams;

  const page = Math.max(1, Number(searchParams.page) || 1);
  const search = String(searchParams.search || "");
  const sort = String(searchParams.sort || "newest");

  const isValidStatus = (value: unknown): value is Status => {
    return value === "all" || value === "active" || value === "inactive";
  };
  const status = isValidStatus(searchParams.status)
    ? searchParams.status
    : "all";

  const { product, totalPages } = await feedPage({
    search,
    status,
    sort,
    page,
  });

  return (
    <div className="flex flex-col">
      <TableSearch />
      <div className="flex justify-end">
        <Button
          mx={"xs"}
          component={Link}
          fullWidth={false}
          href={"/admin/urunler/urun-ekle"}
        >
          Ürün Ekle
        </Button>
      </div>
      <TableSelection products={product} />
      <SpecialPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
};
export default ProductPage;
