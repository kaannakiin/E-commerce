import { prisma } from "@/lib/prisma";
import { SearchParams } from "@/types/types";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import UserHeader from "./_components/UserHeader";
import UserTable from "./_components/UserTable";
import SpecialPagination from "@/components/Pagination";
interface FeedPageParams {
  page: number;
  search: string | null;
}
export type UserTableType = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
    phone: true;
    role: true;
    surname: true;
    emailVerified: true;
  };
}>;

const ITEMS_PER_PAGE = 10; // Add pagination constant
const fetchUsersWithCount = cache(async ({ page, search }: FeedPageParams) => {
  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const whereClause: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              surname: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          ],
        }
      : {};
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        surname: true,
        emailVerified: true,
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
    });
    const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
    return {
      users,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
});

const AccountsManagmentPage = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const searchparams = await searchParams;
  const search = (searchparams.search as string) || null;
  const page = parseInt(searchparams.page as string) || 1;
  const result = await fetchUsersWithCount({ search, page });

  return (
    <div className="flex min-h-screen w-full flex-col p-10">
      <UserHeader />
      {result?.users && <UserTable data={result.users} />}
      <div className="flex-1" />
      <div className="flex justify-center py-5">
        <SpecialPagination
          currentPage={page}
          totalPages={result?.totalPages || 1}
        />
      </div>
    </div>
  );
};
export default AccountsManagmentPage;
