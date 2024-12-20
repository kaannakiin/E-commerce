import React from "react";
import { Params, SearchParams } from "@/types/types";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditDiscountForm from "../_components/EditDiscountForm";
const feedDiscount = cache(async (slug) => {
  try {
    const discount = await prisma.discountCode.findUnique({
      where: {
        id: slug,
      },
      select: {
        id: true,
        active: true,
        code: true,
        discountAmount: true,
        discountType: true,
        uses: true,
        expiresAt: true,
        allProducts: true,
        limit: true,
        createdAt: true,
        variants: {
          select: {
            id: true,
            product: {
              select: {
                name: true,
              },
            },
            type: true,
            unit: true,
            value: true,
          },
        },
      },
    });
    if (!discount) {
      return notFound();
    }
    const variants = await prisma.variant.findMany({
      where: { softDelete: false },
      select: {
        id: true,
        product: {
          select: {
            name: true,
          },
        },
        type: true,
        unit: true,
        value: true,
      },
    });
    return { discount, variants };
  } catch (error) {
    return error;
  }
});
const page = async (props: { params: Params; searchParams: SearchParams }) => {
  const slug = (await props.params).slug;
  const { discount, variants } = await feedDiscount(slug);
  return (
    <div>
      <EditDiscountForm allVariants={variants} discountCode={discount} />
    </div>
  );
};

export default page;
