import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProduct from "../../_components/EditProduct";
import { Prisma } from "@prisma/client";

const page = async (props) => {
  const params = await props.params;
  const feed = async () => {
    const product = await prisma.variant.findUnique({
      where: {
        slug: params.id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            taxRate: true,
            categories: true,
            shortDescription: true,
          },
        },
        Image: {
          select: {
            url: true,
          },
        },
      },
    });
    if (product === null) {
      return notFound();
    }

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return { product, categories };
  };
  const { product, categories } = await feed();

  return <EditProduct product={product} categories={categories} />;
};

export default page;
