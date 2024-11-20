import { auth } from "@/auth";
import EmptyStateProduct from "@/components/EmptyStateProduct";
import FilterDrawer from "@/components/FilterDrawer";
import SpecialPagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import { VariantType } from "@prisma/client";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { cache, Fragment } from "react";

// Types
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

// Cached database queries
const checkCategory = cache(async (slug: string) => {
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
      // Check if category exists and is active
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
        product: {
          categories: {
            some: {
              slug: slug,
              active: true,
            },
          },
        },
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
      deletedAt: null, // Sadece silinmemiş favorileri getir
    },
    select: { variantId: true },
  });
});
// Schema Generator
const generateSchemaOrg = (
  category: CategoryInfo | null,
  products: CategoryVariant[],
  baseUrl: string,
) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category?.name,
    description: category?.description,
    url: `${baseUrl}/category/${category?.slug}`,
    hasPart: products.map((product) => ({
      "@type": "Product",
      name: product.product.name,
      description: product.product.shortDescription,
      image: product.Image[0]?.url,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "TRY",
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      },
    })),
  };
};

// Metadata Generator
export async function generateMetadata(
  { params, searchParams }: { params: Params; searchParams: SearchParams },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = (await params).slug;

  // Category existence check
  const categoryCheck = await checkCategory(slug);
  if (!categoryCheck) {
    return {
      title: "Kategori Bulunamadı",
      description: "Aradığınız kategori bulunamadı",
    };
  }

  const category = await getCategoryInfo(slug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yoursite.com";
  const page = (await searchParams).page || "1";
  const canonical = `${baseUrl}/category/${slug}${
    page !== "1" ? `?page=${page}` : ""
  }`;

  return {
    title: `${category?.name || "Ürünler"} | Sitenizin Adı`,
    description:
      category?.description ||
      `${category?.name} kategorisindeki en iyi ürünleri keşfedin.`,
    keywords: [
      `${category?.name}`,
      "online alışveriş",
      "ürünler",
      "en iyi fiyatlar",
    ],
    openGraph: {
      title: `${category?.name} | Sitenizin Adı`,
      description: category?.description,
      images: [
        {
          url: category?.Image[0]?.url || "/default-category-image.jpg",
          width: 1200,
          height: 630,
          alt: category?.name,
        },
      ],
      type: "website",
      locale: "tr_TR",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: `${category?.name} `,
      description: category?.description,
      images: [category?.Image[0]?.url || "/default-category-image.jpg"],
    },
    alternates: {
      canonical: canonical,
    },
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    other: {
      "format-detection": "telephone=no",
    },
  };
}
type ProductType = {
  id: string;
  type: string;
  value: string;
  price: number;
  slug: string;
  discount: number;
  stock: number;
  createdAt: Date;
  product: {
    name: string;
    taxRate: number;
    shortDescription: string;
    categories: Array<{ name: string; slug: string }>;
  };
  Image: Array<{ url: string }>;
  unit?: string;
};
// Main Page Component
const page = async (props: { params: Params; searchParams: SearchParams }) => {
  const params = await props.searchParams;
  const page = parseInt(params.page as string, 10) || 1;
  const skip = (page - 1) * 8;
  const orderBy = (params.orderBy as string) || "newest";
  const minPrice = parseInt(params.minPrice as string, 10) || 0;
  const maxPrice = parseInt(params.maxPrice as string, 10) || 10000;
  const slug = (await props.params).slug;
  // Category existence check
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yoursite.com";
  const schemaOrg = generateSchemaOrg(
    category,
    response.categoryVariants,
    baseUrl,
  );
  const session = await auth();
  const favorites = await getFavorites(session?.user?.id);
  const favoriteIds = favorites.map((f) => f.variantId);
  return (
    <Fragment>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
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
    </Fragment>
  );
};

export default page;
