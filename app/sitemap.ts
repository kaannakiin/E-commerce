import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

// URL'leri güvenli hale getiren yardımcı fonksiyon
function sanitizeUrl(url: string): string {
  return url
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
interface StaticPage {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
}
const STATIC_PAGES: StaticPage[] = [
  { path: "", priority: 1.0, changeFrequency: "daily" }, // Ana sayfa
  { path: "kategori", priority: 0.9, changeFrequency: "weekly" },
  { path: "hakkimizda", priority: 0.7, changeFrequency: "monthly" },
  { path: "iletisim", priority: 0.7, changeFrequency: "monthly" },
  { path: "gizlilik-politikasi", priority: 0.5, changeFrequency: "monthly" },
  { path: "satis-sozlesmesi", priority: 0.5, changeFrequency: "monthly" },
];
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://8495-31-223-89-243.ngrok-free.app";

  const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map(
    ({ path, priority, changeFrequency }) => ({
      url: sanitizeUrl(`${baseUrl}/${path}`),
      lastModified: new Date(),
      priority,
      changeFrequency,
    }),
  );

  try {
    const [variantsUrls, categoriesUrls] = await Promise.all([
      prisma.variant
        .findMany({
          where: {
            isPublished: true,
            softDelete: false,
          },
          select: {
            slug: true,
            updatedAt: true,
            Image: {
              select: { url: true },
            },
            product: {
              select: { shortDescription: true },
            },
          },
        })
        .then((variants): MetadataRoute.Sitemap => {
          return variants.map((variant) => ({
            url: sanitizeUrl(`${baseUrl}/${variant.slug}`),
            lastModified: new Date(variant.updatedAt),
            priority: 0.8,
            changeFrequency: "daily" as const,
            images: variant.Image.map((image) =>
              sanitizeUrl(
                `${baseUrl}/api/user/asset/get-image?url=${encodeURIComponent(
                  image.url,
                )}&og=true`,
              ),
            ),
          }));
        }),
      prisma.category
        .findMany({
          where: {
            active: true,
          },
          select: {
            slug: true,
            updatedAt: true,
            images: {
              select: { url: true },
            },
          },
        })
        .then((categories): MetadataRoute.Sitemap => {
          return categories.map((category) => ({
            url: sanitizeUrl(`${baseUrl}/category/${category.slug}`),
            lastModified: new Date(category.updatedAt),
            priority: 0.9,
            changeFrequency: "weekly" as const,
            images: category.images.map((image) =>
              sanitizeUrl(
                `${baseUrl}/api/user/asset/get-image?url=${encodeURIComponent(
                  image.url,
                )}&og=true`,
              ),
            ),
          }));
        }),
    ]);
    return [
      ...staticPages,
      ...categoriesUrls.map((item) => ({
        ...item,
        url: encodeURI(item.url),
      })),
      ...variantsUrls.map((item) => ({
        ...item,
        url: encodeURI(item.url),
        images: item.images?.map((img) => encodeURI(img)),
      })),
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticPages;
  }
}
