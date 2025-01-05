import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { slugify } from "@/utils/SlugifyVariants";
import { ECommerceAgreements } from "@prisma/client";
import { notFound } from "next/navigation";
import React, { cache } from "react";
import { Paper, Title, Text, Container, Group } from "@mantine/core";
import { RiCalendarLine, RiRefreshLine } from "react-icons/ri";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// HTML içeriğini güvenli bir şekilde parse etmek için
const createMarkup = (html: string) => {
  return { __html: html };
};

const formatDate = (date: Date) => {
  return format(date, "d MMMM yyyy HH:mm", { locale: tr });
};

const agreementSlugs = Object.values(ECommerceAgreements).reduce(
  (acc, type) => {
    acc[slugify(type)] = type;
    return acc;
  },
  {} as Record<string, ECommerceAgreements>,
);

const getAgreementTypeFromSlug = (slug: string): ECommerceAgreements | null => {
  const normalizedSlug = slugify(slug);
  return agreementSlugs[normalizedSlug] || null;
};

const feedPage = cache(async (slug: ECommerceAgreements) => {
  try {
    const privacy = await prisma.policies.findUnique({
      where: { type: slug },
      select: {
        content: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!privacy) {
      return notFound();
    }
    return privacy;
  } catch (error) {
    console.error(error);
    return notFound();
  }
});

const PolicyUserPage = async ({ params }: { params: Params }) => {
  const slug = (await params).slug;
  const agreementType = getAgreementTypeFromSlug(slug);

  if (!agreementType) {
    return notFound();
  }

  const data = await feedPage(agreementType);

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Title order={1} size="h2" mb="md">
          {data.title}
        </Title>

        <Group gap="lg" mb="xl" c="dimmed">
          <Group gap="xs">
            <RiCalendarLine size={20} />
            <Text size="sm">Oluşturulma: {formatDate(data.createdAt)}</Text>
          </Group>
          <Group gap="xs">
            <RiRefreshLine size={20} />
            <Text size="sm">Son Güncelleme: {formatDate(data.updatedAt)}</Text>
          </Group>
        </Group>

        <div
          dangerouslySetInnerHTML={createMarkup(data.content)}
          className="space-y-4 text-pretty [&>blockquote]:mb-4 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>em]:italic [&>h1]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h3]:mb-2 [&>h3]:text-lg [&>h3]:font-bold [&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-4 [&>p]:leading-relaxed [&>strong]:font-bold [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-5"
        />
      </Paper>
    </Container>
  );
};

export default PolicyUserPage;
