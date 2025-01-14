import { auth } from "@/auth";
import EmptyStateProduct from "@/components/EmptyStateProduct";
import FilterDrawer from "@/components/FilterDrawer";
import SpecialPagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import {
  generateCategoryJsonLd,
  sanitizeAndValidateJsonLd,
} from "@/utils/generateJsonLD";
import { VariantType } from "@prisma/client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

// Önce interface'leri güncelleyelim
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

interface CategoryType {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  images: {
    url: string;
  }[];
  googleCategory: {
    id: number;
    name: string;
    breadcrumbs: string[];
    parentPath: string;
    fullPath: string;
  } | null;
}

interface ParentCategory {
  name: string;
  slug: string;
}

interface ChildCategory {
  name: string;
  description: string | null;
  slug: string;
}

interface FeedCatResponse {
  categoryVariants: CategoryVariant[];
  count: number;
  category: CategoryType | null;
  parentCategories: ParentCategory[];
  childCategories: ChildCategory[];
}

export async function generateMetadata(props: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const slug = (await props.params).slug;

  const category = await prisma.category.findFirst({
    where: {
      slug,
      active: true,
    },
    select: {
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      images: { select: { url: true } },
    },
  });

  if (!category) {
    return {
      title: "Kategori bulunamadı",
      description: "Kategori bulunamadı",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const url = `/categories/${slug}`;

  return {
    title: category.metaTitle,
    description: category.metaDescription,
    keywords: category.metaKeywords?.split(","),
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      url: `${baseUrl}${url}`,
      type: "website",
      images: category.images.map((image) => ({
        url: `${baseUrl}/api/user/asset/get-image?url=$${encodeURIComponent(image.url)}&og=true`,
      })),
      locale: "tr-TR",
    },
    alternates: {
      canonical: `${baseUrl}${url}`,
    },
    appLinks: {
      web: {
        url: `${baseUrl}${url}`,
        should_fallback: true,
      },
    },
    twitter: {
      card: "summary_large_image",
      title: category.metaTitle,
      site: "@site",
      images: category.images.map((image) => ({
        url: `${baseUrl}/api/user/asset/get-image?url=$${encodeURIComponent(image.url)}&og=true`,
      })),
    },
  };
}

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

      const category = await prisma.category.findFirst({
        where: {
          slug,
          active: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          images: {
            select: { url: true },
          },
          googleCategory: {
            select: {
              id: true,
              name: true,
              breadcrumbs: true,
              parentPath: true,
              fullPath: true,
            },
          },
        },
      });

      if (!category) {
        return {
          categoryVariants: [],
          count: 0,
          category: null,
          childCategories: [],
          parentCategories: [],
        };
      }

      // Üst kategorileri getir
      const parentCategories = category.googleCategory?.breadcrumbs
        ? await prisma.category.findMany({
            where: {
              name: {
                in: category.googleCategory.breadcrumbs,
              },
              active: true,
            },
            select: {
              name: true,
              slug: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          })
        : [];

      // Alt kategorileri getir
      const childCategories = await prisma.category.findMany({
        where: {
          googleCategory: {
            parentPath: category.googleCategory?.fullPath,
          },
          active: true,
        },
        select: {
          name: true,
          description: true,
          slug: true,
        },
      });

      const whereClause = {
        softDelete: false,
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
        product: {
          categories: {
            some: {
              slug: slug,
              active: true,
            },
          },
        },
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
            unit: true,
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

      return {
        categoryVariants,
        count,
        category,
        parentCategories,
        childCategories,
      };
    } catch (error) {
      console.error("Error in feedCat:", error);
      return {
        categoryVariants: [],
        count: 0,
        category: null,
        parentCategories: [],
        childCategories: [],
      };
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

  const response = await feedCat({
    slug,
    take: 8,
    skip,
    orderBy,
    minPrice,
    maxPrice,
  });

  if (!response.category) {
    notFound();
  }

  const jsonLd = generateCategoryJsonLd({
    category: response.category,
    products: response.categoryVariants.map((variant) => ({
      id: variant.id,
      name: variant.product.name,
      description: variant.product.shortDescription,
      slug: variant.slug,
      Image: variant.Image,
      variants: [
        {
          price: variant.price,
          discount: variant.discount,
          stock: variant.stock,
        },
      ],
      taxRate: variant.product.taxRate,
    })),
    parentCategories: response.parentCategories,
    childCategories: response.childCategories,
  });

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(response.count / ITEMS_PER_PAGE);
  const session = await auth();
  const favorites = await getFavorites(session?.user?.id);
  const favoriteIds = favorites.map((f) => f.variantId);
  const sanitizedJsonLd = sanitizeAndValidateJsonLd(jsonLd);

  return (
    <div className="flex w-full flex-col px-3 py-5 sm:px-6 md:px-8 lg:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: sanitizedJsonLd,
        }}
      />
      <h1 className="mb-4 text-2xl font-bold">{response.category.name}</h1>
      {response.category.description && (
        <p className="mb-6 text-gray-600">{response.category.description}</p>
      )}
      <FilterDrawer count={response.count} />
      <div className="mt-6">
        {response.count > 0 ? (
          <div className="grid w-full grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
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
