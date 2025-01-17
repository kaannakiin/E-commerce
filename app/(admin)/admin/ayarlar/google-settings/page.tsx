import { Card, CardSection, Group, Image, Text } from "@mantine/core";
import GoogleAnalyticsForm from "./_components/GoogleAnalyticsForm";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
const links: {
  url: string;
  title: string;
  description: string;
  type: "googleTag" | "googleAnalytics" | "metaPixel";
}[] = [
  {
    type: "googleTag",
    url: "https://img.icons8.com/color/48/google-tag-manager.png",
    title: "Google Tag Manager",
    description: "Web sitenizin izleme ve pazarlama etiketlerini yönetin",
  },
  {
    type: "googleAnalytics",

    url: "https://img.icons8.com/color/48/google-analytics.png",
    title: "Google Analytics",
    description: "Web sitesi trafiği ve kullanıcı davranışlarını analiz edin",
  },
  {
    type: "metaPixel",
    url: "https://img.icons8.com/fluency/48/meta.png",
    title: "Meta Pixel",
    description: "Facebook reklamları ve dönüşüm takibini yönetin",
  },
];
const FeedPage = cache(async () => {
  try {
    const data = await prisma.mainSeoSettings.findFirst({
      select: {
        googleAnalytics: true,
        googleAnalyticsIsEnabled: true,
        googleTagManager: true,
        googleTagManagerIsEnabled: true,
        metaPixel: true,
        metaPixelIsEnabled: true,
      },
    });
    if (!data) return null;
    return data;
  } catch (error) {
    return null;
  }
});
export type GoogleSettingsPageType = Prisma.MainSeoSettingsGetPayload<{
  select: {
    googleAnalytics: true;
    googleAnalyticsIsEnabled: true;
    googleTagManager: true;
    googleTagManagerIsEnabled: true;
    metaPixel: true;
    metaPixelIsEnabled: true;
  };
}>;
const GoogleSettingsPage = async () => {
  const data = await FeedPage();
  return (
    <div className="p-5 lg:p-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {links.map((service) => (
          <Card key={service.title} shadow="sm" radius="md" withBorder>
            <CardSection p="md">
              <Group>
                <Image
                  src={service.url}
                  alt={service.title}
                  width={48}
                  height={48}
                />
                <div>
                  <Text fw={500} size="lg">
                    {service.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {service.description}
                  </Text>
                </div>
              </Group>
            </CardSection>

            <GoogleAnalyticsForm type={service.type} data={data} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GoogleSettingsPage;
