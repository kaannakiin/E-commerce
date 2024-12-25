import { Card } from "@mantine/core";
import React, { cache, Suspense } from "react";
import MarqueeForm from "./_components/MarqueeForm";
import { prisma } from "@/lib/prisma";
import MainLoader from "@/components/MainLoader";
import AltSectionImageForm from "./_components/AltSectionImageForm";
const feedPage = cache(async () => {
  try {
    const [infoWhatsapp, marquee] = await Promise.all([
      prisma.altSectionImage.findFirst({
        include: {
          image: true,
        },
      }),
      prisma.customMarquee.findFirst(),
    ]);
    return {
      marquee: {
        text: marquee?.text || "Sepete  %10 indirim kazanın!",
        textColor: marquee?.textColor || "#f7f7f7",
        textPadding: marquee?.textPadding || 10,
        bgColor: marquee?.bgColor || "#f7f7f7",
        fontSize: marquee?.fontSize || 16,
        slidingSpeed: marquee?.SlidingSpeed || 20,
        isActive: marquee?.isActive ?? true,
        url: marquee?.url || "#",
      },
    };
  } catch (error) {
    console.log(error);
    return {
      whatsapp: null,
      marquee: null,
    };
  }
});
const HomePageSectionEditPage = async () => {
  const { marquee } = await feedPage();
  return (
    <Suspense fallback={<MainLoader />}>
      <Card
        withBorder
        padding="xl"
        shadow="md"
        className="mx-auto grid max-w-4xl grid-cols-1 gap-8 bg-gray-50 md:grid-cols-2"
      >
        <MarqueeForm {...marquee} />
        <AltSectionImageForm />
      </Card>
    </Suspense>
  );
};

export default HomePageSectionEditPage;
