import CustomImage from "@/components/CustomImage";
import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { Anchor, Breadcrumbs, Card, Text } from "@mantine/core";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { notFound } from "next/navigation";
import React, { cache } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";

const feedPage = cache(async (slug: string) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: {
        slug,
        active: true,
      },
      select: {
        author: true,
        blogTitle: true,
        blogDescription: true,
        Html: true,
        image: {
          select: {
            url: true,
            alt: true,
          },
        },
        createdAt: true,
        pageDescription: true,
        pageTitle: true,
        updatedAt: true,
      },
    });
    if (!blog) return notFound();
    return blog;
  } catch (error) {
    console.log(error);
    return notFound();
  }
});

const BlogPage = async (params: { params: Params }) => {
  const slug = (await params.params).slug;
  const data = await feedPage(slug);
  const breadcrumbsItems = [
    { title: "Anasayfa", href: "/" },
    { title: "Blog", href: "/blog" },
    { title: data.blogTitle, href: null },
  ];

  return (
    <div className="flex w-full flex-col p-4 lg:p-10">
      <div className="mb-2 flex items-center justify-start">
        <Breadcrumbs
          separator={<MdKeyboardArrowRight className="h-2 w-2 lg:h-4 lg:w-4" />}
        >
          {breadcrumbsItems.map((item, index) =>
            index === breadcrumbsItems.length - 1 ? (
              <Text key={index} c="secondary.9" td="underline">
                {item.title}
              </Text>
            ) : (
              <Anchor href={item.href} key={index}>
                {item.title}
              </Anchor>
            ),
          )}
        </Breadcrumbs>
      </div>

      <div className="flex min-h-screen w-full flex-col">
        <Card
          withBorder
          shadow="sm"
          padding="lg"
          radius="md"
          bg="secondary.1"
          className="mb-6"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-5 lg:col-span-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                <CustomImage
                  src={data.image.url}
                  quality={60}
                  alt={data.image.alt || data.blogTitle}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col md:col-span-7 lg:col-span-8">
              <Text
                component="h1"
                fw={700}
                size="xl"
                className="mb-4 md:text-2xl lg:text-3xl"
              >
                {data.blogTitle}
              </Text>

              <Text
                size="md"
                className="flex-grow text-gray-700 md:text-lg lg:text-xl"
              >
                {data.blogDescription}
              </Text>

              <div className="mt-4 flex flex-col gap-2 text-gray-600">
                <Text size="sm" className="md:text-sm">
                  <span className="font-semibold">Yazar: </span>
                  {data.author
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Text>
                <Text size="sm" className="md:text-sm">
                  <span className="font-semibold">Yayınlanma Tarihi: </span>
                  {format(new Date(data.createdAt), "dd MMMM yyyy HH:mm", {
                    locale: tr,
                  })}
                </Text>
                <Text size="sm" className="md:text-sm">
                  <span className="font-semibold">Son Güncelleme Tarihi: </span>
                  {format(new Date(data.updatedAt), "dd MMMM yyyy HH:mm", {
                    locale: tr,
                  })}
                </Text>
              </div>
            </div>
          </div>
        </Card>

        <Card
          withBorder
          shadow="sm"
          padding="lg"
          radius="md"
          className="prose-container"
        >
          <div
            className="prose max-w-none prose-headings:text-gray-800 prose-h1:mb-4 prose-h1:text-2xl prose-h1:font-bold prose-h2:mb-3 prose-h2:text-xl prose-h2:font-semibold prose-h3:mb-2 prose-h3:text-lg prose-h3:font-medium prose-h4:mb-2 prose-h4:text-base prose-h4:font-medium prose-p:mb-4 prose-p:text-base prose-p:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-ul:my-4 prose-li:text-gray-600 prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: data.Html }}
          />
        </Card>
      </div>
    </div>
  );
};

export default BlogPage;
