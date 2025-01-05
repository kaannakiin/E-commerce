import SpecialPagination from "@/components/Pagination";
import { prisma } from "@/lib/prisma";
import { SearchParams } from "@/types/types";
import { Paper, Title } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import BlogCard from "./_components/BlogCard";

export async function generateMetadata(params: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const searchParams = await params.searchParams;
  const page = parseInt(searchParams.page as string, 10) || 1;
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://www.mydomain.com"; // .env'den domain bilgisini alıyoruz

  return {
    title: page === 1 ? "Blog Yazıları " : `Blog Yazıları - ${page}`,
    description: "En güncel blog yazılarımızı keşfedin.",
    openGraph: {
      title: page === 1 ? "Blog Yazıları " : `Blog Yazıları - ${page}`,
      description: "En güncel blog yazılarımızı keşfedin. ",
    },
    alternates: {
      canonical: page === 1 ? `${domain}/blog` : `${domain}/blog?page=${page}`,
    },
  };
}

export type BlogCardType = Prisma.BlogGetPayload<{
  select: {
    author: true;
    blogDescription: true;
    blogTitle: true;
    slug: true;
    createdAt: true;
    image: {
      select: {
        url: true;
      };
    };
  };
}>;
const getTotalBlogs = cache(async () => {
  return await prisma.blog.count({
    where: {
      active: true,
    },
  });
});

const feedPage = cache(async (take: number, skip: number) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        active: true,
      },
      select: {
        author: true,
        blogDescription: true,
        blogTitle: true,
        slug: true,
        createdAt: true,
        image: {
          select: {
            url: true,
          },
        },
      },
      take,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });
    if (blogs) {
      return blogs;
    } else {
      return notFound();
    }
  } catch (error) {
    return notFound();
  }
});
const BlogListPage = async (params: { searchParams: SearchParams }) => {
  const searchParams = await params.searchParams;
  const page = parseInt(searchParams.page as string, 10) || 1;
  const take = 10;
  const skip = (page - 1) * take;
  const totalBlogs = await getTotalBlogs();
  const totalPages = Math.ceil(totalBlogs / take);
  const blogs = await feedPage(take, skip);

  return (
    <div className="flex min-h-screen flex-col gap-2">
      <Paper radius={0} w="100%" py="xl" className="px-10">
        <div className="max-w-4xl">
          <Title c="dark.4" className="mb-3 text-4xl font-bold" order={1}>
            Blog Sayfamıza Hoş Geldiniz | Tüm Bloglar
          </Title>
        </div>
      </Paper>
      <div className="grid gap-4 px-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {blogs.map((blog) => (
          <BlogCard data={blog} key={blog.slug} />
        ))}
      </div>

      <div className="mt-auto flex pb-8">
        <SpecialPagination currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default BlogListPage;
