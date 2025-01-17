import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/SlugifyVariants";
import { MetadataRoute } from "next";
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
  { path: "hakkimizda", priority: 0.7, changeFrequency: "monthly" },
  { path: "iletisim", priority: 0.7, changeFrequency: "monthly" },
  { path: "tum-urunler", priority: 0.7, changeFrequency: "daily" },
];
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map(
    ({ path, priority, changeFrequency }) => ({
      url: sanitizeUrl(`${baseUrl}/${path}`),
      lastModified: new Date(),
      priority,
      changeFrequency,
    }),
  );

  try {
    const [policies, variantsData, categoriesData, blogsData] =
      await Promise.all([
        prisma.policies.findMany(),
        prisma.variant.findMany({
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
        }),
        prisma.category.findMany({
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
        }),
        prisma.blog.findMany({
          where: {
            active: true,
          },
          select: {
            slug: true,
            updatedAt: true,
            image: {
              select: { url: true },
            },
          },
        }),
      ]);
    const variantsUrls =
      variantsData?.length > 0
        ? variantsData.map((variant): MetadataRoute.Sitemap[number] => ({
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
          }))
        : [];

    const categoriesUrls =
      categoriesData?.length > 0
        ? categoriesData.map((category): MetadataRoute.Sitemap[number] => ({
            url: sanitizeUrl(`${baseUrl}/categories/${category.slug}`),
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
          }))
        : [];
    const policiesUrls =
      policies?.length > 0
        ? policies.map((policy) => ({
            url: sanitizeUrl(`${baseUrl}/sozlesmeler/${slugify(policy.type)}`),
            lastModified: new Date(policy.updatedAt),
            priority: 0.9,
            changeFrequency: "yearly" as const,
          }))
        : [];
    // Blogs için kontrol ve dönüşüm
    const blogUrls =
      blogsData?.length > 0
        ? blogsData.map((blog): MetadataRoute.Sitemap[number] => ({
            url: sanitizeUrl(`${baseUrl}/blog/${blog.slug}`),
            lastModified: new Date(blog.updatedAt),
            priority: 0.8,
            changeFrequency: "weekly" as const,
            images: blog.image
              ? [
                  sanitizeUrl(
                    `${baseUrl}/api/user/asset/get-image?url=${encodeURIComponent(
                      blog.image.url,
                    )}&og=true`,
                  ),
                ]
              : undefined,
          }))
        : [];

    return [
      ...staticPages,
      ...(policiesUrls?.map((item) => ({
        ...item,
        url: encodeURI(item.url),
      })) || []),
      ...(categoriesUrls?.map((item) => ({
        ...item,
        url: encodeURI(item.url),
        images: item.images?.map((img) => encodeURI(img)),
      })) || []),
      ...(variantsUrls?.map((item) => ({
        ...item,
        url: encodeURI(item.url),
        images: item.images?.map((img) => encodeURI(img)),
      })) || []),
      ...(blogUrls?.map((item) => ({
        ...item,
        url: encodeURI(item.url),
        images: item.images?.map((img) => encodeURI(img)),
      })) || []),
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticPages;
  }
}
