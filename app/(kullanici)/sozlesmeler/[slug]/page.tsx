import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { slugify } from "@/utils/SlugifyVariants";
import { ECommerceAgreements } from "@prisma/client";
import { notFound } from "next/navigation";
import React, { cache } from "react";
import {
  Paper,
  Title,
  Text,
  Container,
  Group,
  TypographyStylesProvider,
} from "@mantine/core";
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
        <TypographyStylesProvider>
          <div dangerouslySetInnerHTML={createMarkup(data.content)} />
        </TypographyStylesProvider>
      </Paper>
    </Container>
  );
};

export default PolicyUserPage;
