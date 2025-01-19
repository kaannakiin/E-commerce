import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import SocialMedia from "./_components/SocialMedia";
export type SocialMediaProps = Prisma.MainSeoSettingsGetPayload<{
  select: {
    id: true;
    themeColor: true;
    themeColorSecondary: true;
    favicon: {
      select: {
        url: true;
      };
    };
    image: {
      select: {
        url: true;
      };
    };
  };
}>;
const feedPage = cache(async () => {
  try {
    const feed = await prisma.mainSeoSettings.findFirst({
      select: {
        id: true,
        themeColor: true,
        themeColorSecondary: true,
        favicon: {
          select: {
            url: true,
          },
        },
        image: {
          select: {
            url: true,
          },
        },
      },
    });
    if (!feed) return null;
    return feed;
  } catch (error) {
    return null;
  }
});
const TemaPage = async () => {
  const feed = await feedPage();
  return (
    <div className="p-4">
      <SocialMedia data={feed} />
    </div>
  );
};

export default TemaPage;
