import AltSectionImages from "@/components/AltSectionImages";
import FeedCategoryCarousels from "@/components/FeedCategoryCarousels";
import FeedFeaturedProducts from "@/components/FeedFeaturedProducts";
import { HeroHeader } from "@/components/HeroHeader";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroHeader />
      <FeedCategoryCarousels />
      <FeedFeaturedProducts />
      <AltSectionImages />
    </div>
  );
}
