import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import SliderTable from "./_components/SliderTable";
export type HeroTable = Prisma.MainHeroSectionGetPayload<{
  include: {
    image: {
      select: {
        url: true;
      };
    };
  };
}>[];
const feedPage = cache(async () => {
  try {
    const sliders = await prisma.mainHeroSection.findMany({
      include: {
        image: {
          select: {
            url: true,
          },
        },
      },
    });
    return sliders;
  } catch (error) {
    return error;
  }
});
const page = async () => {
  const slider = await feedPage();
  return (
    <div className="px-4 py-10">
      <div className="flex w-full flex-row gap-4"></div>
      <SliderTable slider={slider} />
    </div>
  );
};

export default page;
