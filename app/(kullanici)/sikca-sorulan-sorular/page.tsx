import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";
import ImageWithSSS from "./_components/ImageWithSSS";
import { Metadata } from "next";
const feedPage = cache(async () => {
  try {
    const data = await prisma.faqSection.findFirst({
      include: {
        displaySettings: true,
        image: { select: { url: true } },
        questions: true,
      },
    });
    if (!data) return null;
    return data;
  } catch (error) {
    return null;
  }
});
export const generateMetadata = async (): Promise<Metadata> => {
  const data = await feedPage();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return {
    title: data?.title || "",
    description: data?.description || "",
    openGraph: {
      type: "website",
      title: data?.title || "",
      description: data?.description || "",
      url: `${baseUrl}/sikca-sorulan-sorular`,
      images: [
        {
          url: `${baseUrl}/api/user/asset/get-image?url=${data?.image.url}&quality=40`,
        },
      ],
    },
    formatDetection: { telephone: false },
    category: "FAQ",
    alternates: {
      canonical: `${baseUrl}/sikca-sorulan-sorular`,
    },
    twitter: {
      card: "summary_large_image",
      title: data?.title || "",
      description: data?.description || "",
      images: [
        `${baseUrl}/api/user/asset/get-image?url=${data?.image.url}&quality=40`,
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
};

export type FaqSectionType = Prisma.FaqSectionGetPayload<{
  include: {
    displaySettings: true;
    image: { select: { url: true } };
    questions: true;
  };
}>;
const FaqPage = async () => {
  const data = await feedPage();
  if (!data) return notFound();
  return (
    <div className="p-4 lg:p-8">
      <ImageWithSSS data={data} />
    </div>
  );
};

export default FaqPage;
