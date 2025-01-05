import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import PoliciesTable from "./_components/PoliciesTable";
import { Button } from "@mantine/core";
import Link from "next/link";
export type PoliciesType = Prisma.PoliciesGetPayload<{
  select: {
    title: true;
    type: true;
    createdAt: true;
    id: true;
  };
}>;
const feedPage = cache(async () => {
  try {
    const polices = await prisma.policies.findMany({
      select: {
        title: true,
        type: true,
        createdAt: true,
        id: true,
      },
    });
    return polices;
  } catch (error) {
    console.error("Feed Page Error:", error);
    return [];
  }
});

const PoliciesPage = async () => {
  const data = await feedPage();
  return (
    <div className="flex flex-col space-y-2 p-10">
      <div className="flex justify-end">
        <Button component={Link} href={"/admin/ayarlar/sozlesmeler/ekle"}>
          Yeni Sözleşme ekle
        </Button>
      </div>
      <PoliciesTable data={data} />
    </div>
  );
};

export default PoliciesPage;
