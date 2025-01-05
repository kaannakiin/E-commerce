import { prisma } from "@/lib/prisma";
import { SearchParams } from "@/types/types";
import { Divider } from "@mantine/core";
import { cache } from "react";
import BlogPostHeader from "./_components/BlogPostHeader";
import BlogTable from "./_components/BlogTable";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
export type BlogDataType = Prisma.BlogGetPayload<{
  select: {
    id: true;
    blogTitle: true;
    author: true;
    createdAt: true;
  };
}>[];
const feedPage = cache(
  async (take: number, skip: number, search?: string, dateRange?: string) => {
    try {
      let dateFilter = {};
      switch (dateRange) {
        case "today":
          dateFilter = {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          };
          break;
        case "yesterday":
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          dateFilter = {
            createdAt: {
              gte: new Date(yesterday.setHours(0, 0, 0, 0)),
              lt: new Date(yesterday.setHours(23, 59, 59, 999)),
            },
          };
          break;
        case "last7days":
          dateFilter = {
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          };
          break;
        case "last30days":
          dateFilter = {
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          };
          break;
        case "thisMonth":
          dateFilter = {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          };
          break;
        case "lastMonth":
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          dateFilter = {
            createdAt: {
              gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
              lt: new Date(
                lastMonth.getFullYear(),
                lastMonth.getMonth() + 1,
                0,
              ),
            },
          };
          break;
        case "thisYear":
          dateFilter = {
            createdAt: {
              gte: new Date(new Date().getFullYear(), 0, 1),
            },
          };
          break;
        case "lastYear":
          dateFilter = {
            createdAt: {
              gte: new Date(new Date().getFullYear() - 1, 0, 1),
              lt: new Date(new Date().getFullYear(), 0, 1),
            },
          };
          break;
      }

      const blogs = await prisma.blog.findMany({
        where: {
          AND: [
            search
              ? {
                  OR: [
                    { pageTitle: { contains: search, mode: "insensitive" } },
                    {
                      pageDescription: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                    { author: { contains: search, mode: "insensitive" } },
                  ],
                }
              : {},
            dateFilter,
          ],
        },
        select: {
          id: true,
          blogTitle: true,
          author: true,
          createdAt: true,
        },
        take: take,
        orderBy: {
          createdAt: "desc",
        },
        skip,
      });
      if (!blogs) return notFound();
      return blogs;
    } catch (error) {
      return notFound();
    }
  },
);
const BlogsPostPage = async (params: { searchParams: SearchParams }) => {
  const searchParams = await params.searchParams;
  const search = (searchParams.search as string) || null;
  const page = parseInt(searchParams.page as string) || null;
  const dateRange = (searchParams.dateRange as string) || null;
  const take = 10;
  const skip = page ? (page - 1) * take : 0;
  const blogs = await feedPage(take, skip, search, dateRange);
  return (
    <div className="flex flex-col">
      <BlogPostHeader />
      <Divider size={"sm"} my={"sm"} />
      <BlogTable data={blogs} />
    </div>
  );
};

export default BlogsPostPage;
