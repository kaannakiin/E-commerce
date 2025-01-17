import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/auth/*",
          "/hesabim/*",
          "/hesabim",
          "/sepet",
          "/odeme",
          "sifremi-unuttum",
          "sifremi-unuttum/*",
          "/arama", // Arama sonuç sayfaları
          "/*?sort=*", // Sıralama parametreleri
          "/*?filter=*", // Filtre parametreleri
          "/*?page=*", // Sayfalama parametreleri
          "/temp/*", // Geçici sayfalar
          "/*.json$", // JSON dosyaları
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: [
          "/api/user/asset/get-image",
          "/*.jpg$",
          "/*.jpeg$",
          "/*.gif$",
          "/*.png$",
          "/*.webp$",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
