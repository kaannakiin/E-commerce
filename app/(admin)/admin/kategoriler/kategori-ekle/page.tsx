import { cache } from "react";
import EditableCategoryForm from "../_components/CategoryForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
const feedPage = cache(async () => {
  const googleCategories = await prisma.googleCategory.findMany({
    where: {
      level: 1,
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
  if (!googleCategories) {
    return notFound();
  }
  return { googleCategories };
});
const CategoryAdd = async () => {
  const { googleCategories } = await feedPage();
  return <EditableCategoryForm googleCategories={googleCategories} />;
};

export default CategoryAdd;
