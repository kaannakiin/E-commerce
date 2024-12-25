import EmptyStateProduct from "@/components/EmptyStateProduct";
import FilterDrawer from "@/components/FilterDrawer";
import SpecialPagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { SessionId } from "@/lib/AuthCache";
import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import { generateProductListJsonLd } from "@/utils/generateJsonLD";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
const feedPage = cache(
  async (
    session: string | undefined,
    take: number,
    skip: number,
    orderBy: string,
    minPrice: number,
    maxPrice: number,
  ) => {
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
    try {
      const allVariant = await prisma.variant.findMany({
        where: {
          isPublished: true,
          product: { active: true },
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
        },
        take,
        skip,
        orderBy: orderByClause,
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
              shortDescription: true,
              taxRate: true,
              categories: {
                select: {
                  slug: true,
                  name: true,
                },
              },
              GoogleCategory: true,
            },
          },
          Image: {
            select: {
              url: true,
            },
          },
        },
      });
      const allVariantCount = await prisma.variant.count();
      const favoriteVariants =
        session !== null
          ? await prisma.user.findUnique({
              where: { id: session },
              select: { FavoriteVariants: true },
            })
          : null;

      const totalPages = Math.ceil(allVariantCount / take);
      return { allVariant, favoriteVariants, totalPages, allVariantCount };
    } catch (error) {
      console.log(error);
      return notFound();
    }
  },
);
export async function generateMetadata(props: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const user = await SessionId();
  const params = await props.searchParams;
  const page = parseInt(params.page as string, 10) || 1;
  const skip = (page - 1) * 12;
  const orderBy = (params.orderBy as string) || "newest";
  const minPrice = parseInt(params.minPrice as string, 10) || 0;
  const maxPrice = parseInt(params.maxPrice as string, 10) || 10000;
  const { allVariant, allVariantCount } = await feedPage(
    user,
    12,
    skip,
    orderBy,
    minPrice,
    maxPrice,
  );

  const categories = await prisma.category.findMany({
    select: {
      name: true,
    },
  });
  const categoryNames = categories.map((cat) => cat.name).join(", ");
  const jsonLd = generateProductListJsonLd(allVariant, allVariantCount);

  return {
    title: `Tüm Ürünler - ${allVariantCount}+ Ürün Çeşidi`,
    description: `${categoryNames} kategorilerinde ${allVariantCount}'den fazla ürün çeşidi ile hizmetinizdeyiz. En uygun fiyatlar ve hızlı teslimat garantisi.`,
    keywords: [
      "online alışveriş",
      "uygun fiyatlı ürünler",
      ...categories.map((cat) => cat.name.toLowerCase()),
    ].join(", "),

    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/tum-urunler`,
    },
  };
}
const AllVariantPage = async (props: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const user = await SessionId();
  const params = await props.searchParams;
  const page = parseInt(params.page as string, 10) || 1;
  const skip = (page - 1) * 12;
  const orderBy = (params.orderBy as string) || "newest";
  const minPrice = parseInt(params.minPrice as string, 10) || 0;
  const maxPrice = parseInt(params.maxPrice as string, 10) || 10000;
  const { allVariant, favoriteVariants, totalPages, allVariantCount } =
    await feedPage(user, 12, skip, orderBy, minPrice, maxPrice);
  const favoriteIds = favoriteVariants?.FavoriteVariants.map((fav) => fav.id);
  const jsonLd = generateProductListJsonLd(allVariant, allVariantCount);

  return (
    <div className="flex w-full flex-col px-3 py-5 sm:px-6 md:px-8 lg:px-10">
      {Array.isArray(jsonLd) &&
        jsonLd.map((item, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(item),
            }}
          />
        ))}
      <h1 className="mb-4 text-2xl font-bold">Tüm Ürünler</h1>
      <FilterDrawer count={allVariantCount} />
      <div className="my-6">
        {allVariantCount > 0 ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {allVariant.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorited={favoriteIds?.includes(product.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyStateProduct />
        )}
      </div>
      {totalPages && (
        <SpecialPagination totalPages={totalPages} currentPage={page} />
      )}
    </div>
  );
};

export default AllVariantPage;
