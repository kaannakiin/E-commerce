import CustomImage from "@/components/CustomImage";
import { prisma } from "@/lib/prisma";
import { AspectRatio, Card, Container, SimpleGrid, Text } from "@mantine/core";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import React, { cache } from "react";
const feedPage = cache(async () => {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        active: true,
      },
      select: {
        image: {
          select: { url: true },
        },
        blogTitle: true,
        blogDescription: true,
        createdAt: true,
        author: true,
        slug: true,
      },
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!blogs) {
      return null;
    }
    return blogs;
  } catch (error) {}
});
const BlogCard = async () => {
  const blogs = await feedPage();
  if (!blogs || blogs.length === 0) {
    return null;
  }
  return (
    <Container
      classNames={{
        root: "lg:w-3/4 w-full",
      }}
      py="xl"
      className="w-full lg:px-10"
    >
      <SimpleGrid cols={{ base: 1, sm: blogs.length > 1 ? 2 : 1 }}>
        {blogs.map((blog) => (
          <Card
            key={blog.blogTitle}
            component={Link}
            href={`/blog/${blog.slug}`}
            className="transition-all duration-150 ease-in hover:scale-[1.01] hover:shadow-md"
          >
            <AspectRatio ratio={1920 / 1080}>
              <CustomImage
                src={blog.image.url}
                quality={40}
                alt={blog.blogTitle}
              />
            </AspectRatio>
            <div className="flex flex-col gap-2 pt-4">
              <Text
                c="dimmed"
                size="xs"
                tt="uppercase"
                fw={600}
                className="tracking-wider text-blue-600"
              >
                {format(new Date(blog.createdAt), "dd MMMM yyyy", {
                  locale: tr,
                })}
              </Text>
              <Text
                fw={700}
                className="text-lg leading-snug tracking-tight text-gray-900"
              >
                {blog.blogTitle}
              </Text>
              <Text
                c="dimmed"
                size="sm"
                className="mt-1 line-clamp-2 text-gray-600"
              >
                {blog.blogDescription}
              </Text>
              <Text size="sm" className="md:text-sm">
                {blog.author
                  .toLowerCase()
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Text>
            </div>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default BlogCard;
