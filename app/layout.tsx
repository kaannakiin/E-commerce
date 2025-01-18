import { generateShades } from "@/lib/colors";
import { prisma } from "@/lib/prisma";
import type { MantineColorsTuple } from "@mantine/core";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { cache } from "react";
import "./globals.css";

const DEFAULT_SETTINGS = {
  title: "%100 Sertifikalı Sağlıklı Yaşam Marketi",
  description:
    "Sertifikalı organik gıdadan doğal kozmetiğe, ev bakım ürünlerinden süper gıdalara kadar tüm doğal yaşam ürünlerini uygun fiyatlarla keşfedin",
  themeColor: "#4C6EF5",
  secondColor: "#4C6EF5",
  baseUrl: "https://8495-31-223-89-243.ngrok-free.app",
} as const;

const feedLayout = cache(async () => {
  try {
    const [seoData, salerInfo] = await Promise.all([
      prisma.mainSeoSettings.findFirst({
        select: {
          description: true,
          title: true,
          image: { select: { url: true } },
          themeColor: true,
          favicon: { select: { url: true } },
          googleAnalytics: true,
          googleAnalyticsIsEnabled: true,
          googleTagManager: true,
          googleTagManagerIsEnabled: true,
          themeColorSecondary: true,
        },
      }),
      prisma.salerInfo.findFirst({
        include: { logo: true },
      }),
    ]);

    return {
      data: seoData,
      salerInfo,
    };
  } catch (error) {
    console.error("Error in feedLayout:", error);
    return { data: null, salerInfo: null };
  }
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await feedLayout();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_SETTINGS.baseUrl;

  const createImageUrl = (
    imageUrl: string | undefined,
    fallbackPath: string,
    queryParam: string, // og veya favicon için parametre
  ) => {
    if (!imageUrl) return `${baseUrl}${fallbackPath}`;
    try {
      if (imageUrl.includes("..") || imageUrl.includes("/")) {
        return `${baseUrl}${fallbackPath}`;
      }

      return `${baseUrl}/api/user/asset/get-image?url=${imageUrl}&${queryParam}=true`;
    } catch {
      return `${baseUrl}${fallbackPath}`;
    }
  };

  const ogImageUrl = createImageUrl(data?.image?.url, "/default-og.jpg", "og");
  const faviconUrl = data?.favicon?.url
    ? createImageUrl(data.favicon.url, "/favicon.ico", "favicon")
    : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: data?.title ?? DEFAULT_SETTINGS.title,
      template: `%s | ${data?.title ?? DEFAULT_SETTINGS.title}`,
    },
    alternates: {
      canonical: `${baseUrl}/`,
    },
    icons: faviconUrl
      ? {
          icon: [
            {
              url: faviconUrl,
              sizes: "32x32",
              type: "image/png",
            },
          ],
        }
      : undefined,
    description: data?.description ?? DEFAULT_SETTINGS.description,
    openGraph: {
      title: data?.title ?? DEFAULT_SETTINGS.title,
      description: data?.description ?? DEFAULT_SETTINGS.description,

      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: data?.title ?? DEFAULT_SETTINGS.title,
          type: "image/jpeg",
        },
      ],
      siteName: data?.title ?? DEFAULT_SETTINGS.title,
      locale: "tr_TR",
      type: "website",
      url: baseUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: data?.title ?? DEFAULT_SETTINGS.title,
      description: data?.description ?? DEFAULT_SETTINGS.description,
      images: ogImageUrl,
    },
  };
}

const createAppTheme = (
  primaryColor: MantineColorsTuple,
  secondaryColors: MantineColorsTuple,
) => {
  return createTheme({
    fontFamily: "Open Sans, sans-serif",
    colors: {
      primary: primaryColor,
      secondary: secondaryColors,
    },
    primaryColor: "primary",
    cursorType: "pointer",
  });
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data } = await feedLayout();
  const baseColor = data?.themeColor ?? DEFAULT_SETTINGS.themeColor;
  const secondColor = data?.themeColorSecondary ?? DEFAULT_SETTINGS.themeColor;
  const primaryColors = [
    generateShades(baseColor, 0.95),
    generateShades(baseColor, 0.85),
    generateShades(baseColor, 0.75),
    generateShades(baseColor, 0.65),
    generateShades(baseColor, 0.55),
    generateShades(baseColor, 0.45),
    generateShades(baseColor, 0.35),
    generateShades(baseColor, 0.25),
    generateShades(baseColor, 0.15),
    generateShades(baseColor, 0.05),
  ] as MantineColorsTuple;
  const secondaryColor = [
    generateShades(secondColor, 0.95),
    generateShades(secondColor, 0.85),
    generateShades(secondColor, 0.75),
    generateShades(secondColor, 0.65),
    generateShades(secondColor, 0.55),
    generateShades(secondColor, 0.45),
    generateShades(secondColor, 0.35),
    generateShades(secondColor, 0.25),
    generateShades(secondColor, 0.15),
    generateShades(secondColor, 0.05),
  ] as MantineColorsTuple;
  const theme = createAppTheme(primaryColors, secondaryColor);
  return (
    <html lang="tr" suppressHydrationWarning className="bg-white">
      {data?.googleTagManagerIsEnabled && data?.googleTagManager && (
        <GoogleTagManager gtmId={data?.googleTagManager} />
      )}
      {data?.googleAnalyticsIsEnabled && data?.googleAnalytics && (
        <GoogleAnalytics gaId={data?.googleAnalytics} />
      )}
      <head>
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body>
        <MantineProvider
          forceColorScheme="light"
          defaultColorScheme="light"
          theme={theme}
        >
          <Notifications />

          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
