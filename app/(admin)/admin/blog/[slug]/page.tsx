import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { Divider } from "@mantine/core";
import { notFound } from "next/navigation";
import React, { cache } from "react";
import BlogForm from "../_components/BlogForm";
import { Prisma } from "@prisma/client";
export type BlogPostDefaultValues = Prisma.BlogGetPayload<{
  select: {
    active: true;
    blogDescription: true;
    blogTitle: true;
    pageDescription: true;
    pageTitle: true;
    author: true;
    Html: true;
    id: true;
    image: {
      select: {
        url: true;
      };
    };
  };
}>;
const feedPage = cache(async (slug: string) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: {
        id: slug,
      },
      select: {
        active: true,
        blogDescription: true,
        blogTitle: true,
        pageDescription: true,
        pageTitle: true,
        author: true,
        Html: true,
        id: true,
        createdAt: true,
        slug: true,
        image: {
          select: {
            url: true,
          },
        },
      },
    });
    if (!blog) return notFound();
    return blog;
  } catch (error) {
    return notFound();
  }
});
const EditBlogPage = async (params: { params: Params }) => {
  const slug = (await params.params).slug;
  const blog = await feedPage(slug);
  return (
    <div className="w-full px-4 pt-6">
      <h4 className="text-center text-xl font-bold">Yeni Blog Yazısı</h4>
      <Divider my={"md"} />
      <BlogForm blog={blog} />
    </div>
  );
};

export default EditBlogPage;
