import { generateShades } from "@/lib/colors";
import { prisma } from "@/lib/prisma";
import type { MantineColorsTuple } from "@mantine/core";
import {
  ColorSchemeScript,
  colorsTuple,
  createTheme,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { cache } from "react";
import "./globals.css";
import { Noto_Sans_Osage, Montserrat } from "next/font/google";
const nato = Noto_Sans_Osage({
  weight: "400",
  subsets: ["latin"],
});
const montserrat = Montserrat({
  weight: "400",
  subsets: ["latin"],
});

const feedLayout = cache(async () => {
  try {
    const [seoData, salerInfo] = await Promise.all([
      prisma.mainSeoSettings.findFirst({
        select: {
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
};

export async function generateMetadata(): Promise<Metadata> {
  return {};
}

const createAppTheme = (primaryColor, secondaryColors) => {
  const primaryColors = [
    generateShades(primaryColor, 0.95),
    generateShades(primaryColor, 0.85),
    generateShades(primaryColor, 0.75),
    generateShades(primaryColor, 0.65),
    generateShades(primaryColor, 0.55),
    generateShades(primaryColor, 0.45),
    generateShades(primaryColor, 0.35),
    generateShades(primaryColor, 0.25),
    generateShades(primaryColor, 0.15),
    generateShades(primaryColor, 0.05),
  ] as MantineColorsTuple;
  const secondaryColor = [
    generateShades(secondaryColors, 0.95),
    generateShades(secondaryColors, 0.85),
    generateShades(secondaryColors, 0.75),
    generateShades(secondaryColors, 0.65),
    generateShades(secondaryColors, 0.55),
    generateShades(secondaryColors, 0.45),
    generateShades(secondaryColors, 0.35),
    generateShades(secondaryColors, 0.25),
    generateShades(secondaryColors, 0.15),
    generateShades(secondaryColors, 0.05),
  ] as MantineColorsTuple;
  return createTheme({
    fontFamily: "Open Sans, sans-serif",
    colors: {
      primary: primaryColors,
      secondary: secondaryColor,
    },
    primaryColor: "primary",
    cursorType: "pointer",
    components: {
      Button: {
        defaultProps: {
          radius: 0,
        },
      },
    },
  });
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data } = await feedLayout();
  const baseColor = data?.themeColor ?? "#4C6EF5";
  const secondColor = data?.themeColorSecondary ?? "#4C6EF5";

  const theme = createAppTheme(baseColor, secondColor);
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
