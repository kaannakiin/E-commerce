import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { VariantData } from "@/zodschemas/authschema";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import ProductForm from "../_components/ProductForm";
import { notFound } from "next/navigation";

export type VariantDataWithDbImages = VariantData & {
  dbImages?: string[];
};

export type ProductWithVariantsType = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    active: true;
    shortDescription: true;
    type: true;
    taxRate: true;
    createdAt: true;
    updatedAt: true;
    googleCategoryId: true;
    categories: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
  };
}> & {
  variants: VariantDataWithDbImages[];
};
export type EditProductType = Prisma.ProductGetPayload<{
  include: {
    categories: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
    GoogleCategory: { select: { id: true; level: true } };
    Variant: { include: { Image: { select: { url: true } } } };
  };
}>;

const fetchGoogleCategories = cache(async (level: number) => {
  try {
    return await prisma.googleCategory.findMany({
      where: {
        level: level || 1,
      },
      select: {
        id: true,
        name: true,
        level: true,
        fullPath: true,
        parentPath: true,
        breadcrumbs: true,
      },
    });
  } catch (error) {
    console.error("Google kategorileri çekilemedi:", error);
    throw new Error("Google kategorileri yüklenirken bir hata oluştu");
  }
});

const fetchProductData = async (slug: string) => {
  if (!slug) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: slug },
    include: {
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      GoogleCategory: {
        select: { id: true, level: true },
      },
      Variant: {
        where: { softDelete: false },
        include: { Image: { select: { url: true } } },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const [categories, googleCategories] = await Promise.all([
    prisma.category.findMany({
      select: {
        name: true,
        id: true,
        slug: true,
      },
    }),
    fetchGoogleCategories(product.GoogleCategory?.level || 1),
  ]);

  if (!categories || categories.length === 0) {
    throw new Error("Kategoriler bulunamadı");
  }

  return {
    product,
    categories,
    googleCategories,
  };
};

const convertToVariantData = (dbVariants): VariantDataWithDbImages[] => {
  if (!dbVariants || !Array.isArray(dbVariants)) {
    return [];
  }

  return dbVariants
    .map((variant) => {
      if (!variant) return null;

      return {
        uniqueId: variant.id,
        type: variant.type,
        value: variant.value,
        unit: variant.unit,
        price: variant.price,
        richTextDescription: variant.richTextDescription,
        slug: variant.slug,
        discount: variant.discount,
        active: variant.isPublished,
        stock: variant.stock,
        isSpotLight: variant.isSpotlightFeatured,
        pageTitle: variant.seoTitle,
        metaDescription: variant.seoDescription,
        dbImages: Array.isArray(variant.Image)
          ? variant.Image.map((img) => img?.url).filter(Boolean)
          : [],
        imageFiles: [],
      };
    })
    .filter(Boolean);
};

const EditProductPage = async (params: { params: Params }) => {
  const slug = (await params.params).slug;

  if (!slug) {
    notFound();
  }

  const { product, categories, googleCategories } =
    await fetchProductData(slug);

  const { Variant, ...productWithoutVariants } = product;
  const productWithDbImages: ProductWithVariantsType = {
    ...productWithoutVariants,
    variants: convertToVariantData(product.Variant),
  };
  return (
    <ProductForm
      googleCategory={googleCategories}
      defaultValues={productWithDbImages}
      data={categories}
    />
  );
};

export default EditProductPage;
