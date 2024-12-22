import { Params } from "@/types/types";
import React, { cache } from "react";
import EditableCategoryForm from "../_components/CategoryForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
export type CategoryFormDefault = Prisma.CategoryGetPayload<{
  select: {
    active: true;
    description: true;
    name: true;
    images: {
      select: {
        url: true;
      };
    };
    googleCategoryId: true;
    products: {
      select: {
        name: true;
        id: true;
      };
    };
    metaTitle: true;
    metaDescription: true;
    metaKeywords: true;
  };
}>;

const feedPage = cache(async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: {
      slug,
    },
    select: {
      active: true,
      description: true,
      name: true,
      images: {
        select: {
          url: true,
        },
      },

      products: {
        select: {
          name: true,
          id: true,
        },
      },
      googleCategoryId: true,
      googleCategory: {
        select: {
          level: true,
        },
      },
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
    },
  });
  if (!category) {
    return notFound();
  }
  const googleCategories = await prisma.googleCategory.findMany({
    where: {
      level: category.googleCategory?.level || 1,
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
  return { category, googleCategories };
});
const EditCategoryPage = async (params: { params: Params }) => {
  const slug = (await params.params).slug;
  const { category, googleCategories } = await feedPage(slug);
  return (
    <EditableCategoryForm
      googleCategories={googleCategories}
      defaultValues={category}
      slug={slug}
    />
  );
};

export default EditCategoryPage;
