import Header from "@/components/Header";
import {
  ColorSchemeScript,
  MantineColorsTuple,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Footer from "@/components/Footer";
export const metadata: Metadata = {
  title: {
    default: "WELNESSCLUB by Oyku",
    template: "%s | WELNESSCLUB by Oyku",
  },
  description:
    "WELNESSCLUB by Oyku, sağlıklı yaşam ve güzellik ürünlerini bir arada sunan bir e-ticaret platformudur. %s",
};
const primaryColor: MantineColorsTuple = [
  "#ecf4ff",
  "#dce4f5",
  "#b9c7e2",
  "#94a8d0",
  "#748dc0",
  "#5f7cb7",
  "#5474b4",
  "#44639f",
  "#3a5890",
  "#2c4b80",
];

const secondaryColor: MantineColorsTuple = [
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
];
const theme = createTheme({
  fontFamily: "Open Sans, sans-serif",
  colors: {
    primary: primaryColor,
    secondary: secondaryColor,
  },
  primaryColor: "primary",
  cursorType: "pointer",
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <SessionProvider>
          <MantineProvider forceColorScheme="light" theme={theme}>
            <Header />
            <main className="min-h-[700px]">{children}</main>
            <Footer />
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
