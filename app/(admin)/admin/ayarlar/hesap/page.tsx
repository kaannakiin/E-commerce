import { prisma } from "@/lib/prisma";
import React, { cache } from "react";
import AddSalesInfoForm from "./_components/AddSalesInfoForm";
import { Prisma } from "@prisma/client";
export type info = Prisma.SalerInfoGetPayload<{
  include: {
    logo: {
      select: {
        url: true;
      };
    };
  };
}>;
const feedPage = cache(async () => {
  try {
    const info = await prisma.salerInfo.findFirst({
      include: {
        logo: {
          select: {
            url: true,
          },
        },
      },
    });
    return info;
  } catch (error) {}
});
const SalesPage = async () => {
  const info = await feedPage();
  return (
    <div className="px-4 py-10">
      <div className="w-full md:w-1/2 lg:mx-auto">
        <AddSalesInfoForm info={info} />
      </div>
    </div>
  );
};

export default SalesPage;
