import AltSectionImages from "@/components/AltSectionImages";
import FeedCategoryCarousels from "@/components/FeedCategoryCarousels";
import FeedFeaturedProducts from "@/components/FeedFeaturedProducts";
import { HeroHeader } from "@/components/HeroHeader";
import BlogCard from "./_components/BlogCard";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import ImageWithSSS from "./sikca-sorulan-sorular/_components/ImageWithSSS";
const feedPage = cache(async () => {
  try {
    const faqSections = await prisma.faqSection.findFirst({
      include: {
        displaySettings: true,
        image: { select: { url: true } },
        questions: true,
      },
    });
    if (!faqSections || faqSections.displaySettings.isMainPage === false) {
      return null;
    }
    return { faqSections };
  } catch (error) {
    return null;
  }
});

export default async function Home() {
  const result = await feedPage();
  return (
    <div className="flex flex-col gap-1">
      <HeroHeader />
      <FeedCategoryCarousels />
      <FeedFeaturedProducts />
      <BlogCard />
      <div className="px-5 py-8">
        {result?.faqSections && <ImageWithSSS data={result.faqSections} />}
      </div>
      <AltSectionImages />
    </div>
  );
}
