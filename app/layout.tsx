import { generateShades } from "@/lib/colors";
import { prisma } from "@/lib/prisma";
import type { MantineColorsTuple } from "@mantine/core";
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { cache } from "react";
import "./globals.css";

const DEFAULT_SETTINGS = {
  title: "%100 Sertifikalı Sağlıklı Yaşam Marketi",
  description:
    "Sertifikalı organik gıdadan doğal kozmetiğe, ev bakım ürünlerinden süper gıdalara kadar tüm doğal yaşam ürünlerini uygun fiyatlarla keşfedin",
  themeColor: "#4C6EF5",
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
          googleId: true,
          googleVerification: true,
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
  const { data, salerInfo } = await feedLayout();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_SETTINGS.baseUrl;

  // Create image URL with proper error handling
  const createImageUrl = (
    imageUrl: string | undefined,
    fallbackPath: string,
    queryParam: string,
  ) => {
    if (!imageUrl) return new URL(fallbackPath, baseUrl).toString();
    try {
      // URL'in geçerli olduğundan emin olalım
      if (imageUrl.includes("..") || imageUrl.includes("/")) {
        return new URL(fallbackPath, baseUrl).toString();
      }

      return new URL(
        `/api/user/asset/get-image?url=${encodeURIComponent(imageUrl)}&${queryParam}=true`,
        baseUrl,
      ).toString();
    } catch {
      return new URL(fallbackPath, baseUrl).toString();
    }
  };

  const ogImageUrl = createImageUrl(data?.image?.url, "/default-og.jpg", "og");
  const faviconUrl = salerInfo?.logo?.url
    ? createImageUrl(salerInfo.logo.url, "/favicon.ico", "favicon")
    : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: data?.title ?? DEFAULT_SETTINGS.title,
      template: `%s | ${data?.title ?? DEFAULT_SETTINGS.title}`,
    },
    alternates: {
      canonical: new URL("/", baseUrl).toString(),
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
    verification: {
      google: data?.googleVerification ?? "",
    },
    openGraph: {
      title: data?.title ?? DEFAULT_SETTINGS.title,
      description: data?.description ?? DEFAULT_SETTINGS.description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: data?.title ?? DEFAULT_SETTINGS.title,
        },
      ],
      siteName: data?.title ?? DEFAULT_SETTINGS.title,
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data?.title ?? DEFAULT_SETTINGS.title,
      description: data?.description ?? DEFAULT_SETTINGS.description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const secondaryColor = [
  "#fcf9e9",
  "#f6f0d9",
  "#ebe0b2",
  "#dfce88",
  "#d6c064",
  "#d0b64d",
  "#cdb240",
  "#b59c31",
  "#a18a28",
  "#8b771b",
] as MantineColorsTuple;

const createAppTheme = (primaryColor: MantineColorsTuple) => {
  return createTheme({
    fontFamily: "Open Sans, sans-serif",
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
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

  // Use default theme color if not provided
  const baseColor = data?.themeColor ?? DEFAULT_SETTINGS.themeColor;

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

  const theme = createAppTheme(primaryColors);

  return (
    <html lang="tr" suppressHydrationWarning className="bg-white">
      <head>
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body>
        <SessionProvider>
          <MantineProvider
            forceColorScheme="light"
            defaultColorScheme="light"
            theme={theme}
          >
            {children}
          </MantineProvider>
        </SessionProvider>
      </body>
{data?.googleId && <GoogleAnalytics gaId={data.googleId} />}
    </html>
  );
}
