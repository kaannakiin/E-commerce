import { calculatePrice } from "@/lib/calculatePrice";
import DOMPurify from "isomorphic-dompurify";

interface JsonLdProps {
  variant;
  calculatedPrice;
  salerInfo;
  seoSite;
  relatedVariants;
}

interface ProductJsonLd {
  "@context": string;
  "@type": string;
  name: string;
  description?: string;
  sku: string;
  image?: string[];
  brand?: {
    "@type": string;
    name: string;
  };
  offers: {
    "@type": string;
    url?: string;
    priceCurrency: string;
    price: number;
    priceValidUntil: string;
    itemCondition: string;
    availability: string;
    seller?: {
      "@type": string;
      name: string;
      telephone?: string;
      email?: string;
    };
  };
  category?: string;
  additionalProperty?: Array<{
    "@type": string;
    name: string;
    value: string;
  }>;
  isRelatedTo?: Array<{
    "@type": string;
    name: string;
    description?: string;
    sku: string;
    image?: string[];
    offers: {
      "@type": string;
      price: number;
      priceCurrency: string;
      availability: string;
      url?: string;
    };
  }>;
}

export function generateProductJsonLd({
  variant,
  calculatedPrice,
  salerInfo,
  seoSite,
  relatedVariants,
}: JsonLdProps) {
  if (!variant?.product || !calculatedPrice || !salerInfo) {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const jsonLdArray = [];

  if (variant.product.name && variant.id) {
    const productJsonLd: ProductJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: variant.product.name,
      description: variant.product?.description,
      sku: variant.id,
      offers: {
        "@type": "Offer",
        url: baseUrl ? `${baseUrl}/${variant.slug}` : undefined,
        priceCurrency: "TRY",
        price: calculatedPrice.finalPrice,
        priceValidUntil: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ).toISOString(),
        itemCondition: "https://schema.org/NewCondition",
        availability:
          variant.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        ...(salerInfo && {
          seller: {
            "@type": "Organization",
            name: salerInfo.storeName,
            ...(salerInfo.contactPhone && {
              telephone: salerInfo.contactPhone,
            }),
            ...(salerInfo.contactEmail && { email: salerInfo.contactEmail }),
          },
        }),
      },
    };

    if (variant.Image?.length > 0) {
      productJsonLd.image = variant.Image.map(
        (img) =>
          `${process.env.NEXT_PUBLIC_APP_URL}/api/user/asset/get-image?url=${encodeURIComponent(img.url)}`,
      ).filter(Boolean);
    }

    if (salerInfo?.storeName) {
      productJsonLd.brand = {
        "@type": "Brand",
        name: salerInfo.storeName,
      };
    }

    if (variant.product.GoogleCategory) {
      productJsonLd.category = variant.product.GoogleCategory.fullPath;
      productJsonLd.additionalProperty = [
        {
          "@type": "PropertyValue",
          name: "Google Product Category",
          value: variant.product.GoogleCategory.name,
        },
        ...(variant.value && variant.unit
          ? [
              {
                "@type": "PropertyValue",
                name: "Weight",
                value: `${variant.value} ${variant.unit}`,
              },
            ]
          : []),
      ];
    }

    if (relatedVariants?.length > 0) {
      productJsonLd.isRelatedTo = relatedVariants
        .filter((rv) => rv?.product?.name && rv.id)
        .map((relatedVariant) => ({
          "@type": "Product",
          name: relatedVariant.product.name,
          description: relatedVariant.product.shortDescription,
          sku: relatedVariant.id,
          ...(relatedVariant.Image?.length > 0 && {
            image: relatedVariant.Image.map(
              (img) =>
                `${process.env.NEXT_PUBLIC_APP_URL}/api/user/asset/get-image?url=${encodeURIComponent(img.url)}`,
            ).filter(Boolean),
          }),
          offers: {
            "@type": "Offer",
            price: calculatePrice(
              relatedVariant.price,
              relatedVariant.discount,
              relatedVariant.product.taxRate,
            ).finalPrice,
            priceCurrency: "TRY",
            availability:
              relatedVariant.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: baseUrl ? `${baseUrl}/${relatedVariant.slug}` : undefined,
          },
        }));
    }

    jsonLdArray.push(productJsonLd);
  }

  // Breadcrumb JSON-LD'si - Sadece gerekli veriler varsa
  if (variant.product.GoogleCategory?.breadcrumbs?.length > 0) {
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Ana Sayfa",
          item: process.env.NEXT_PUBLIC_APP_URL,
        },
        ...variant.product.GoogleCategory.breadcrumbs
          .filter(Boolean)
          .map((item: string, index: number) => ({
            "@type": "ListItem",
            position: index + 2,
            name: item,
            item: `${baseUrl}/categories/${encodeURIComponent(item.toLowerCase())}`,
          })),
        {
          "@type": "ListItem",
          position: variant.product.GoogleCategory.breadcrumbs.length + 2,
          name: variant.product.name,
          item: `${baseUrl}/${variant.slug}`,
        },
      ],
    };
    jsonLdArray.push(breadcrumbJsonLd);
  }

  // Organization JSON-LD'si - Sadece gerekli veriler varsa
  if (salerInfo?.storeName) {
    const organizationJsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: salerInfo.storeName,
      ...(salerInfo.storeDescription && {
        description: salerInfo.storeDescription,
      }),
      ...(process.env.NEXT_PUBLIC_APP_URL && {
        url: process.env.NEXT_PUBLIC_APP_URL,
      }),
      ...(salerInfo.logoId && {
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/api/user/asset/get-image?url=${salerInfo.logoId}`,
      }),
      ...(salerInfo.address && {
        address: {
          "@type": "PostalAddress",
          streetAddress: salerInfo.address,
          addressCountry: "TR",
        },
      }),
      ...(salerInfo.contactPhone || salerInfo.contactEmail
        ? {
            contactPoint: {
              "@type": "ContactPoint",
              ...(salerInfo.contactPhone && {
                telephone: salerInfo.contactPhone,
              }),
              ...(salerInfo.contactEmail && { email: salerInfo.contactEmail }),
              contactType: "customer service",
            },
          }
        : {}),
      ...(salerInfo.facebook ||
      salerInfo.instagram ||
      salerInfo.twitter ||
      salerInfo.pinterest
        ? {
            sameAs: [
              salerInfo.facebook &&
                `https://facebook.com/${salerInfo.facebook}`,
              salerInfo.instagram &&
                `https://instagram.com/${salerInfo.instagram}`,
              salerInfo.twitter && `https://twitter.com/${salerInfo.twitter}`,
              salerInfo.pinterest &&
                `https://pinterest.com/${salerInfo.pinterest}`,
            ].filter(Boolean),
          }
        : {}),
    };
    jsonLdArray.push(organizationJsonLd);
  }

  return jsonLdArray.length > 0 ? jsonLdArray : null;
}
interface CategoryJsonLdProps {
  category;
  products;
  parentCategories?;
  childCategories?;
}

export function generateCategoryJsonLd({
  category,
  products,
  parentCategories,
  childCategories,
}: CategoryJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const jsonLdArray = [];

  if (!category?.slug) {
    return null;
  }

  // Ana kategori ve ürün listesi JSON-LD'si
  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${baseUrl}/categories/${category.slug}#itemlist`,
    name: category.name,
    description: category.description,
    numberOfItems: products?.length || 0,
    itemListElement:
      products
        ?.map((product, index) => {
          if (!product?.variants || !Array.isArray(product.variants)) {
            return null;
          }

          return {
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Product",
              "@id": `${baseUrl}/${product.slug}`,
              name: product.name || "",
              description: product.description || "",
              sku: product.id,
              image: product.Image?.[0]?.url
                ? `${baseUrl}/api/user/asset/get-image?url=${encodeURIComponent(
                    product.Image[0].url,
                  )}`
                : null,
              url: `${baseUrl}/${product.slug}`,
              offers: {
                "@type": "AggregateOffer",
                "@id": `${baseUrl}/${product.slug}#offers`,
                priceCurrency: "TRY",
                lowPrice: calculateLowestPrice(
                  product.variants || [],
                  product.taxRate || 0,
                ),
                highPrice: calculateHighestPrice(
                  product.variants || [],
                  product.taxRate || 0,
                ),
                offerCount: product.variants?.length || 0,
                availability: product.variants?.some((v) => v?.stock > 0)
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              },
              brand: {
                "@type": "Brand",
                name: "Your Brand Name",
              },
              category: category.name,
              itemCondition: "https://schema.org/NewCondition",
            },
          };
        })
        .filter(Boolean) || [],
  };

  jsonLdArray.push(categoryJsonLd);

  // Breadcrumb JSON-LD'si kontrolünü güncelleyelim
  if (category?.GoogleCategory?.breadcrumbs?.length > 0) {
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${baseUrl}/categories/${category.slug}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@id": baseUrl,
            name: "Ana Sayfa",
          },
        },
        ...(category.GoogleCategory.breadcrumbs?.map((cat, index) => ({
          "@type": "ListItem",
          position: index + 2,
          item: {
            "@id": `${baseUrl}/categories/${encodeURIComponent(cat.toLowerCase())}`,
            name: cat,
          },
        })) || []),
      ],
    };
    jsonLdArray.push(breadcrumbJsonLd);
  }

  // Alt kategoriler kontrolünü de güncelleyelim
  if (Array.isArray(childCategories) && childCategories.length > 0) {
    const collectionJsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${baseUrl}/categories/${category.slug}#collection`,
      name: category.name || "",
      description: category.description || "",
      breadcrumb: {
        "@id": `${baseUrl}/categories/${category.slug}#breadcrumb`,
      },
      mainEntity: {
        "@id": `${baseUrl}/categories/${category.slug}#itemlist`,
      },
      hasPart: childCategories
        .map((child) => ({
          "@type": "ItemList",
          "@id": `${baseUrl}/categories/${child?.slug || ""}`,
          name: child?.name || "",
          description: child?.description || "",
          url: `${baseUrl}/categories/${child?.slug || ""}`,
        }))
        .filter((item) => item.name), // Boş ismi olan öğeleri filtrele
    };
    jsonLdArray.push(collectionJsonLd);
  }

  return {
    "@context": "https://schema.org",
    "@graph": jsonLdArray,
  };
}

// Yardımcı fonksiyonlar
function calculateLowestPrice(variants, taxRate: number): number {
  if (!variants?.length) return 0;

  return (
    variants.reduce((min, v) => {
      const price = calculatePrice(v.price, v.discount, taxRate).finalPrice;
      return Math.min(min, price);
    }, Infinity) || 0
  );
}

function calculateHighestPrice(variants, taxRate: number): number {
  if (!variants?.length) return 0;

  return (
    variants.reduce((max, v) => {
      const price = calculatePrice(v.price, v.discount, taxRate).finalPrice;
      return Math.max(max, price);
    }, -Infinity) || 0
  );
}
// Gerekli alanları kontrol eden yardımcı fonksiyon
const validateJsonLdStructure = (jsonLd): boolean => {
  // Temel JSON-LD gereksinimlerini kontrol et
  if (!jsonLd["@context"] || !jsonLd["@type"]) {
    console.error("Missing required JSON-LD fields: @context or @type");
    return false;
  }

  // Tip'e göre gerekli alanları kontrol et
  switch (jsonLd["@type"]) {
    case "Product":
      if (!jsonLd.name || !jsonLd.offers) {
        console.error("Missing required Product fields");
        return false;
      }
      if (jsonLd.offers && !jsonLd.offers.price) {
        console.error("Missing required Product offer price");
        return false;
      }
      break;

    case "BreadcrumbList":
      if (!Array.isArray(jsonLd.itemListElement)) {
        console.error("Missing or invalid itemListElement in BreadcrumbList");
        return false;
      }
      break;

    case "Organization":
      if (!jsonLd.name) {
        console.error("Missing required Organization name");
        return false;
      }
      break;

    // Diğer tip kontrolleri buraya eklenebilir
  }

  return true;
};

// JSON-LD sanitize ve doğrulama fonksiyonu
export function sanitizeAndValidateJsonLd(jsonLd) {
  if (!jsonLd) return "{}";

  try {
    if (Array.isArray(jsonLd)) {
      const wrappedJsonLd = {
        "@context": "https://schema.org",
        "@graph": jsonLd,
      };
      return JSON.stringify(wrappedJsonLd);
    }
    return JSON.stringify(jsonLd);
  } catch (error) {
    console.error("Error sanitizing JSON-LD:", error);
    return "{}";
  }
}
export function generateProductListJsonLd(variants, totalProducts: number) {
  if (!variants || !Array.isArray(variants)) {
    return []; // Boş array dön
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  // ItemList JSON-LD
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${baseUrl}/tum-urunler#itemlist`,
    name: "Tüm Ürünler",
    numberOfItems: totalProducts,
    itemListElement: variants
      .filter(
        (variant) => variant?.id && variant?.product?.name && variant?.slug,
      )
      .map((variant, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          "@id": `${baseUrl}/${variant.slug}`,
          name: variant.product.name,
          description: variant.product.shortDescription || undefined,
          sku: variant.id,
          ...(variant.Image?.[0]?.url && {
            image: `${baseUrl}/api/user/asset/get-image?url=${encodeURIComponent(
              variant.Image[0].url,
            )}`,
          }),
          url: `${baseUrl}/${variant.slug}`,
          offers: {
            "@type": "Offer",
            priceCurrency: "TRY",
            price: variant.price * (1 - (variant.discount || 0) / 100),
            availability:
              variant.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          },
          ...(variant.product?.GoogleCategory?.id && {
            googleProductCategory: variant.product.GoogleCategory.id,
            category: variant.product.GoogleCategory.fullPath,
          }),
          weight: {
            "@type": "QuantitativeValue",
            value: variant.value,
            unitCode: variant.unit,
          },
        },
      })),
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${baseUrl}/tum-urunler#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@id": baseUrl,
          name: "Ana Sayfa",
        },
      },
      ...(variants[0]?.product?.GoogleCategory?.breadcrumbs?.map(
        (crumb, index) => ({
          "@type": "ListItem",
          position: index + 2,
          item: {
            "@id": `${baseUrl}/${encodeURIComponent(
              crumb.toLowerCase().replace(/\s+/g, "-"),
            )}`,
            name: crumb,
          },
        }),
      ) || []),
    ],
  };

  return [itemListJsonLd, breadcrumbJsonLd];
}
