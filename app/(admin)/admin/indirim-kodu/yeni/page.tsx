import { prisma } from "@/lib/prisma";
import DiscountForm from "../_components/DiscountForm";
import { cache } from "react";

const feedForm = cache(async () => {
  return await prisma.variant.findMany({
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
});

const AddNewDiscountPage = async () => {
  const variants = await feedForm();
  return (
    <div>
      <DiscountForm variants={variants} />
    </div>
  );
};

export default AddNewDiscountPage;
