import { prisma } from "@/lib/prisma";
import { cache } from "react";
import ProductForm from "../_components/ProductForm";
import { Prisma } from "@prisma/client";
export type googleType = Prisma.GoogleCategoryGetPayload<{
  select: {
    id: true;
    name: true;
    level: true;
    fullPath: true;
    parentPath: true;
    breadcrumbs: true;
  };
}>;
export type categoryType = Prisma.CategoryGetPayload<{
  select: {
    name: true;
    id: true;
    slug: true;
  };
}>;
const feed = cache(async () => {
  const [categories, googleCategories] = await Promise.all([
    prisma.category.findMany({
      select: {
        name: true,
        id: true,
        slug: true,
      },
    }),
    prisma.googleCategory.findMany({
      where: { level: 1 },
      select: {
        id: true,
        name: true,
        level: true,
        fullPath: true,
        parentPath: true,
        breadcrumbs: true,
      },
    }),
  ]);

  return {
    categories,
    googleCategories,
  };
});

const AdminAddProduct = async () => {
  const data = await feed();
  return (
    <ProductForm
      data={data.categories}
      googleCategory={data.googleCategories}
    />
  );
};
export default AdminAddProduct;
