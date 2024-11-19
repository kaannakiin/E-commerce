import { prisma } from "@/lib/prisma";
import { cache } from "react";
import HeroesEdit from "../../_components/HeroesEdit";
const feedMain = cache(async () => {
  try {
    const heros = await prisma.mainHeroSection.findMany({
      select: {
        id: true,
        buttonLink: true,
        buttonTitle: true,
        image: {
          select: {
            url: true,
          },
        },
        text: true,
        title: true,
      },
    });
    return heros;
  } catch (error) {
    return error;
  }
});
const MainHeader = async () => {
  const heros = await feedMain();
  if (heros.length === 0) return <HeroesEdit />;
  return <HeroesEdit initialData={heros} />;
};

export default MainHeader;
