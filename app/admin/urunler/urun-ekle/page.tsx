import { prisma } from "@/lib/prisma";
import AddProductForm from "../../AdminComponents/AddProductForm";

const AdminAddProduct = async () => {
  const feedCat = await prisma.category.findMany({
    select: {
      name: true,
      id: true,
    },
  });
  return <AddProductForm feedCat={feedCat} />;
};

export default AdminAddProduct;
