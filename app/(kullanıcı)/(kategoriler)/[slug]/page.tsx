import { auth } from "@/auth";
import EmptyStateProduct from "@/components/EmptyStateProduct";
import FilterDrawer from "@/components/FilterDrawer";
import SpecialPagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import { VariantType } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";

export interface CategoryVariant {
  id: string;
  type: VariantType;
  value: string;
  price: number;
  slug: string;
  discount: number;
  stock: number;
  createdAt: Date;
  unit?: string;
  product: {
    name: string;
    shortDescription: string;
    taxRate: number;
    categories: {
      name: string;
      slug: string;
    }[];
  };
  Image: {
    url: string;
  }[];
}

interface FeedCatResponse {
  categoryVariants: CategoryVariant[];
  count: number;
}

interface CategoryInfo {
  name: string;
  description: string | null;
  slug: string;
  Image: { url: string }[];
}

const checkCategory = cache(async (slug: string) => {
  if (slug === "urunler") return { id: "all", slug: "urunler", active: true };

  try {
    const category = await prisma.category.findFirst({
      where: {
        slug: slug,
        active: true,
      },
      select: {
        id: true,
        slug: true,
        active: true,
      },
    });
    return category;
  } catch (error) {
    console.error("Error checking category:", error);
    return null;
  }
});

const getCategoryInfo = cache(
  async (slug: string): Promise<CategoryInfo | null> => {
    if (slug === "urunler") {
      return {
        name: "Tüm Ürünler",
        description: "Tüm ürünlerimize göz atın",
        slug: "urunler",
        Image: [],
      };
    }

    try {
      const category = await prisma.category.findFirst({
        where: {
          slug: slug,
          active: true,
        },
        select: {
          name: true,
          description: true,
          slug: true,
          Image: {
            select: { url: true },
          },
        },
      });
      return category;
    } catch (error) {
      console.error("Error fetching category info:", error);
      return null;
    }
  },
);

const feedCat = cache(
  async ({
    slug,
    take,
    skip,
    orderBy,
    minPrice,
    maxPrice,
  }: {
    slug: string;
    take: number;
    skip: number;
    orderBy: string;
    minPrice: number;
    maxPrice: number;
  }): Promise<FeedCatResponse> => {
    try {
      const categoryExists = await checkCategory(slug);
      if (!categoryExists) {
        return { categoryVariants: [], count: 0 };
      }

      let orderByClause: unknown = {};
      switch (orderBy) {
        case "price-asc":
          orderByClause = { price: "asc" };
          break;
        case "price-desc":
          orderByClause = { price: "desc" };
          break;
        case "newest":
          orderByClause = { createdAt: "desc" };
          break;
        default:
          orderByClause = { createdAt: "asc" };
      }

      const whereClause = {
        isPublished: true,
        stock: {
          gt: 0,
        },
        AND: [
          {
            price: {
              gte: minPrice,
            },
          },
          {
            price: {
              lte: maxPrice,
            },
          },
        ],
        ...(slug !== "urunler" && {
          product: {
            categories: {
              some: {
                slug: slug,
                active: true,
              },
            },
          },
        }),
      };

      const [categoryVariants, count] = await Promise.all([
        prisma.variant.findMany({
          take,
          skip,
          where: whereClause,
          select: {
            id: true,
            type: true,
            value: true,
            price: true,
            slug: true,
            discount: true,
            stock: true,
            createdAt: true,
            product: {
              select: {
                name: true,
                taxRate: true,
                shortDescription: true,
                categories: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            Image: {
              select: {
                url: true,
              },
            },
          },
          orderBy: orderByClause,
        }),
        prisma.variant.count({ where: whereClause }),
      ]);

      return { categoryVariants, count };
    } catch (error) {
      console.error("Error in feedCat:", error);
      return { categoryVariants: [], count: 0 };
    }
  },
);
const getFavorites = cache(async (userId: string | undefined) => {
  if (!userId) return [];

  return prisma.favoriteVariants.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    select: { variantId: true },
  });
});

const page = async (props: { params: Params; searchParams: SearchParams }) => {
  const params = await props.searchParams;
  const page = parseInt(params.page as string, 10) || 1;
  const skip = (page - 1) * 8;
  const orderBy = (params.orderBy as string) || "newest";
  const minPrice = parseInt(params.minPrice as string, 10) || 0;
  const maxPrice = parseInt(params.maxPrice as string, 10) || 10000;
  const slug = (await props.params).slug;

  const categoryCheck = await checkCategory(slug);
  if (!categoryCheck) {
    notFound();
  }

  const [response, category] = await Promise.all([
    feedCat({
      slug,
      take: 8,
      skip,
      orderBy,
      minPrice,
      maxPrice,
    }),
    getCategoryInfo(slug),
  ]);

  if (!category) {
    notFound();
  }

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(response.count / ITEMS_PER_PAGE);
  const session = await auth();
  const favorites = await getFavorites(session?.user?.id);
  const favoriteIds = favorites.map((f) => f.variantId);

  return (
    <div className="flex w-full flex-col px-3 py-5 sm:px-6 md:px-8 lg:px-10">
      <h1 className="mb-4 text-2xl font-bold">{category.name}</h1>
      {category.description && (
        <p className="mb-6 text-gray-600">{category.description}</p>
      )}
      <FilterDrawer count={response.count} />
      <div className="mt-6">
        {response.count > 0 ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {response.categoryVariants.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorited={favoriteIds.includes(product.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyStateProduct />
        )}
      </div>
      {totalPages > 1 && (
        <SpecialPagination totalPages={totalPages} currentPage={page} />
      )}
    </div>
  );
};

export default page;
