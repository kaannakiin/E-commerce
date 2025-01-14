import { prisma } from "@/lib/prisma";
import React, { cache } from "react";
import MainFaqForm from "./_components/MainFaqForm";
import { Prisma } from "@prisma/client";
export type FaqType = Prisma.FaqSectionGetPayload<{
  include: {
    image: { select: { url: true } };
    questions: true;
    displaySettings: true;
  };
}>;
const feedPage = cache(async () => {
  try {
    const data = await prisma.faqSection.findFirst({
      include: {
        image: { select: { url: true } },
        questions: true,
        displaySettings: true,
      },
    });
    if (!data) return null;
    return data;
  } catch (error) {
    return null;
  }
});
const FaqSection = async () => {
  const data = await feedPage();
  return (
    <div className="h-full min-h-screen w-full p-5">
      <MainFaqForm data={data} />
    </div>
  );
};

export default FaqSection;
