import { prisma } from "@/lib/prisma";
import AddProductForm from "../../_components/AddProductForm";
import { cache } from "react";
const feed = cache(async () => {
  const feedCat = await prisma.category.findMany({
    select: {
      name: true,
      id: true,
    },
  });
  return feedCat;
});
const AdminAddProduct = async () => {
  const feedCat = await feed();
  return <AddProductForm feedCat={feedCat} />;
};

export default AdminAddProduct;
