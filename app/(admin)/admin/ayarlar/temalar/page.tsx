import { prisma } from "@/lib/prisma";
import { Card, Divider } from "@mantine/core";
import { cache } from "react";
import SocialMedia from "./_components/SocialMedia";
const feedPage = cache(async () => {
  try {
    const feed = await prisma.mainSeoSettings.findFirst({
      select: {
        id: true,
        title: true,
        description: true,
        themeColor: true,
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
      <Card withBorder shadow="xs">
        <div className="my-2">
          <h1 className="text-2xl font-semibold">SEO Ayarları</h1>
          <p className="text-sm text-gray-500">
            SEO ayarlarını ve sitenizin sosyal medya, arama motorları
            görünürlüğünü buradan düzenleyebilirsiniz.
          </p>
        </div>
        <Divider />
        <div className="flex flex-col gap-4 py-4">
          <SocialMedia data={feed} />
        </div>
      </Card>
    </div>
  );
};

export default TemaPage;
