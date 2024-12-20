import { HeroCarousel } from "./HeroHeaderClient";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const feedHerod = cache(async () => {
  try {
    const hero = await prisma.mainHeroSection.findMany({
      where: {
        isPublished: true,
      },
      select: {
        alt: true,
        isPublished: true,
        type: true,
        isFunctionality: true,
        title: true,
        buttonLink: true,
        buttonTitle: true,
        text: true,
        image: {
          select: {
            url: true,
          },
        },
      },
    });
    if (!hero) return null;
    return hero;
  } catch (error) {
    return null;
  }
});

export async function HeroHeader() {
  const feedHero = await feedHerod();

  if (!feedHero) return null;

  return <HeroCarousel items={feedHero} />;
}
