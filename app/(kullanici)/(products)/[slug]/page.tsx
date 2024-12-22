import { auth } from "@/auth";
import AddToCartButton from "@/components/AddToCartButton";
import FavHeart from "@/components/FavHeart";
import ProductDetails from "@/components/InfoAccordion";
import ProductGallery from "@/components/ProductGallery";
import { calculatePrice } from "@/lib/calculatePrice";
import { formattedPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { ColorSwatch, Divider } from "@mantine/core";
import { Prisma, VariantType } from "@prisma/client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Fragment } from "react";
import { FaClockRotateLeft } from "react-icons/fa6";
import CategoryCarousel from "../_components/CategoryCarouselForProductPage";
import {
  generateProductJsonLd,
  sanitizeAndValidateJsonLd,
} from "@/utils/generateJsonLD";

export type ProductTypeForCarousel = Prisma.VariantGetPayload<{
  select: {
    id: true;
    type: true;
    value: true;
    price: true;
    slug: true;
    discount: true;
    stock: true;
    createdAt: true;
    unit: true;
    product: {
      select: {
        name: true;
        taxRate: true;
        shortDescription: true;
        categories: {
          select: {
            name: true;
            slug: true;
          };
        };
      };
    };
    Image: {
      select: {
        url: true;
      };
    };
  };
}> & { isFavorite: boolean };

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

const getPageData = cache(async (variantSlug: string) => {
  const mainVariant = await prisma.variant.findUnique({
    where: {
      slug: variantSlug,
      softDelete: false,
      isPublished: true,
    },
    include: {
      product: {
        include: {
          categories: true,
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

  if (!mainVariant) {
    return notFound();
  }

  const relatedVariants = await prisma.variant.findMany({
    where: {
      NOT: {
        slug: variantSlug,
      },
      product: {
        active: true,
        categories: {
          some: {
            id: {
              in: mainVariant.product.categories.map((cat) => cat.id),
            },
          },
        },
      },
      softDelete: false,
      isPublished: true,
    },
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
    distinct: ["productId"],
  });

  const seoSite = await prisma.mainSeoSettings.findFirst();
  const salerInfo = await prisma.salerInfo.findFirst();

  const calculatedPrice = calculatePrice(
    mainVariant.price,
    mainVariant.discount,
    mainVariant.product.taxRate,
  );

  const ogImage = `${process.env.NEXT_PUBLIC_APP_URL}/api/user/asset/get-image?url=${encodeURIComponent(mainVariant.Image[0].url)}&og=true`;

  const jsonLd = generateProductJsonLd({
    variant: mainVariant,
    calculatedPrice,
    salerInfo,
    seoSite,
    relatedVariants,
  });

  return {
    mainVariant,
    relatedVariants,
    seoSite,
    salerInfo,
    calculatedPrice,
    ogImage,
    jsonLd,
  };
});

export async function generateMetadata(params: {
  params: Params;
}): Promise<Metadata> {
  const slug = (await params.params).slug;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const {
    mainVariant: variant,
    seoSite,
    salerInfo,
    ogImage,
  } = await getPageData(slug);

  return {
    title: variant.seoTitle,
    description: variant.seoDescription,
    keywords: [
      variant.product.name,
      variant.product.categories.map((cat) => cat.name).join(","),
    ],
    alternates: {
      canonical: baseUrl + "/" + variant.slug,
    },
    openGraph: {
      title: variant.seoTitle,
      description: variant.seoDescription,
      url: baseUrl + "/" + variant.slug,
      siteName: seoSite?.title,
      type: "website",
      images: [
        {
          url: ogImage,
          alt: variant.product.name,
          width: 1200,
          height: 630,
        },
      ],
      phoneNumbers: "+90" + salerInfo?.contactPhone.replace(/\D/g, ""),
      emails: salerInfo?.contactEmail,
      countryName: "Turkey",
      locale: "tr_TR",
      ttl: 60 * 60 * 24,
    },
  };
}

const ProductsPage = async (params: { params: Params }) => {
  const session = await auth();
  const favoriteIds = await getFavorites(session?.user?.id);
  const slug = (await params.params).slug;

  if (slug.endsWith(".svg") || slug.endsWith(".ico")) {
    notFound();
  }

  const {
    mainVariant: variant,
    relatedVariants,
    jsonLd,
    calculatedPrice,
  } = await getPageData(slug);

  const isFavorited = favoriteIds.some((fav) => fav.variantId === variant.id);
  const relatedVariantsWithFavorites = relatedVariants.map((product) => ({
    ...product,
    isFavorite: favoriteIds.some((fav) => fav.variantId === product.id),
  }));

  return (
    <div className="container mx-auto px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: sanitizeAndValidateJsonLd(jsonLd),
        }}
      />

      <div className="flex flex-col space-y-8">
        <div className="mt-2 px-2 lg:px-10">
          <div className="flex w-full flex-col items-start gap-2 lg:flex-row">
            <div className="w-full lg:w-2/3">
              <div className="mx-auto max-w-4xl">
                <ProductGallery
                  images={variant.Image.map((image) => image.url)}
                />
              </div>
            </div>
            <div className="flex w-full flex-col space-y-6 lg:flex-1 lg:p-6">
              <div className="relative space-y-2">
                <FavHeart isFavorited={isFavorited} productId={variant.id} />
                <h1 className="text-3xl font-medium uppercase tracking-tight text-gray-900">
                  {variant.product.name}
                </h1>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {variant.discount ? (
                      <Fragment>
                        <span className="text-2xl font-semibold text-primary-500">
                          {formattedPrice(calculatedPrice.finalPrice)}
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                          {formattedPrice(calculatedPrice.originalPrice)}
                        </span>
                        <span className="rounded bg-green-50 px-2 py-1 text-sm font-medium text-green-600">
                          %{calculatedPrice.discount} İndirim
                        </span>
                      </Fragment>
                    ) : (
                      <span className="text-2xl font-semibold text-primary-500">
                        {formattedPrice(calculatedPrice.finalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="prose prose-sm text-gray-600">
                <p>{variant.product.description}</p>
              </div>

              <div className="space-y-4">
                {variant.type === VariantType.COLOR && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      Renk:
                    </span>
                    <ColorSwatch
                      color={variant.value}
                      className="h-6 w-6 rounded-full shadow-sm"
                    />
                  </div>
                )}

                {variant.type === VariantType.SIZE && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      Beden:
                    </span>
                    <span className="rounded-md border px-3 py-1 text-sm">
                      {variant.value}
                    </span>
                  </div>
                )}

                {variant.type === VariantType.WEIGHT && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      Ağırlık:
                    </span>
                    <span className="rounded-md border px-3 py-1 text-sm">
                      {variant.value} {variant.unit}
                    </span>
                  </div>
                )}
              </div>
              <AddToCartButton variant={variant} />
              <div className="flex flex-col gap-3 border-t pt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaClockRotateLeft className="text-primary-500" />
                  <span>2-3 İş Günü İçinde Kargo</span>
                </div>
              </div>
              <ProductDetails richText={variant.richTextDescription} />
            </div>
          </div>
          <Divider className="my-8" size="lg" />
          <div className="w-full">
            <CategoryCarousel products={relatedVariantsWithFavorites} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
