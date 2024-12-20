import { generateShades } from "@/lib/colors";
import { prisma } from "@/lib/prisma";
import type { MantineColorsTuple } from "@mantine/core";
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import type { Metadata, Viewport } from "next"; // Viewport type'ını import ediyoruz
import { SessionProvider } from "next-auth/react";
import { cache } from "react";
import "./globals.css";
const feedLayout = cache(async () => {
  try {
    const data = await prisma.mainSeoSettings.findFirst({
      select: {
        description: true,
        title: true,
        image: { select: { url: true } },
        themeColor: true,
      },
    });
    if (!data) return null;
    return data;
  } catch (error) {}
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await feedLayout();
  const defaultTitle = "DevelopedByHann1ball";
  const defaultDescription =
    "Modern ve yenilikçi web çözümleri sunan DevelopedByHann1ball ile dijital varlığınızı güçlendirin. Full-stack web development hizmetleri.";

  // Base URL'i environment'tan al
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://8495-31-223-89-243.ngrok-free.app";

  // OG Image URL'ini oluştur

  const ogImageUrl = data?.image?.url
    ? new URL(
        `/api/user/asset/get-image?url=${data.image.url}&og=true`,
        baseUrl,
      ).toString()
    : new URL("/default-og.jpg", baseUrl).toString();

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: data?.title || defaultTitle,
      template: `%s | ${data?.title || defaultTitle}`,
    },
    description: data?.description || defaultDescription,
    openGraph: {
      title: data?.title || defaultTitle,
      description: data?.description || defaultDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: data?.title || defaultTitle,
        },
      ],
      siteName: data?.title || defaultTitle,
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data?.title || defaultTitle,
      description: data?.description || defaultDescription,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
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
  const data = await feedLayout();
  const baseColor = data?.themeColor || "#2E2E2E";

  // Mantine color tuple oluştur
  const primaryColors = [
    generateShades(baseColor, 0.95), // 0
    generateShades(baseColor, 0.85), // 1
    generateShades(baseColor, 0.75), // 2
    generateShades(baseColor, 0.65), // 3
    generateShades(baseColor, 0.55), // 4
    generateShades(baseColor, 0.45), // 5
    generateShades(baseColor, 0.35), // 6
    generateShades(baseColor, 0.25), // 7
    generateShades(baseColor, 0.15), // 8
    generateShades(baseColor, 0.05), // 9
  ] as MantineColorsTuple;

  const theme = createAppTheme(primaryColors);

  return (
    <html lang="tr" suppressHydrationWarning className="bg-white">
      <head>
        <ColorSchemeScript forceColorScheme="light" />{" "}
        <link rel="shortcut icon" href="/favicon.svg" />
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
    </html>
  );
}
