import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import { Title } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import DiscountHeader from "./_components/DiscountHeader";
import DiscountTable from "./_components/DiscountTable";

export type DiscountType = "expired" | "unexpired" | "all";

const feedPage = cache(async (search: string, type: DiscountType) => {
  try {
    const searchCondition: Prisma.DiscountCodeWhereInput = search
      ? {
          OR: [
            {
              code: {
                contains: search,
                mode: Prisma.QueryMode.insensitive, // String yerine Prisma.QueryMode kullanıyoruz
              },
            },
            {
              discountAmount: {
                equals: !isNaN(Number(search)) ? Number(search) : undefined,
              },
            },
          ],
        }
      : {};

    // Süresi/limiti dolmuş kuponlar (expired)
    const expiredWhere: Prisma.DiscountCodeWhereInput = {
      AND: [
        searchCondition,
        {
          OR: [
            { active: false },
            {
              expiresAt: {
                not: null,
                lt: new Date(),
              },
            },
            {
              AND: [
                { limit: { not: null } },
                { uses: { gte: prisma.discountCode.fields.limit } },
              ],
            },
          ],
        },
      ],
    };

    // Aktif kuponlar (unexpired)
    const activeWhere: Prisma.DiscountCodeWhereInput = {
      AND: [
        searchCondition,
        {
          active: true,
          AND: [
            {
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            {
              OR: [
                { limit: null },
                {
                  AND: [
                    { limit: { not: null } },
                    { uses: { lt: prisma.discountCode.fields.limit } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    // Tüm kuponlar için where
    const allWhere: Prisma.DiscountCodeWhereInput = searchCondition;

    // Type'a göre where sorgusunu seç
    const whereCondition =
      {
        expired: expiredWhere,
        unexpired: activeWhere,
        all: allWhere,
      }[type] || activeWhere;

    const coupons = await prisma.discountCode.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
    });

    return coupons;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
});

const DiscountTablePage = async (props: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const searchParams = await props.searchParams;
  const type = (searchParams.type as DiscountType) || "all";
  const search = (searchParams.search as string) || "";
  const coupons = await feedPage(search, type);

  return (
    <div className="flex w-full flex-col space-y-6 p-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <Title order={2} className="text-gray-800">
          İndirim Kuponları Yönetimi
        </Title>
      </div>
      <DiscountHeader />
      <div className="mt-6">
        <DiscountTable type={type} coupons={coupons} />
      </div>
    </div>
  );
};

export default DiscountTablePage;
