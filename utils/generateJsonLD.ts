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
      products?.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          "@id": `${baseUrl}/${product.slug}`,
          name: product.name,
          description: product.description,
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
            lowPrice: calculateLowestPrice(product.variants, product.taxRate),
            highPrice: calculateHighestPrice(product.variants, product.taxRate),
            offerCount: product.variants.length,
            availability: product.variants.some((v) => v.stock > 0)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
          brand: {
            "@type": "Brand",
            name: "Your Brand Name", // Marka adınızı buraya ekleyin
          },
          category: category.name,
          itemCondition: "https://schema.org/NewCondition",
        },
      })) || [],
  };
  jsonLdArray.push(categoryJsonLd);

  // Breadcrumb JSON-LD'si
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
      ...(parentCategories?.map((cat, index) => ({
        "@type": "ListItem",
        position: index + 2,
        item: {
          "@id": `${baseUrl}/categories/${cat.slug}`,
          name: cat.name,
        },
      })) || []),
      {
        "@type": "ListItem",
        position: (parentCategories?.length || 0) + 2,
        item: {
          "@id": `${baseUrl}/categories/${category.slug}`,
          name: category.name,
        },
      },
    ],
  };
  jsonLdArray.push(breadcrumbJsonLd);

  // Alt kategoriler varsa CollectionPage JSON-LD'si
  if (childCategories?.length > 0) {
    const collectionJsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${baseUrl}/categories/${category.slug}#collection`,
      name: category.name,
      description: category.description,
      breadcrumb: {
        "@id": `${baseUrl}/categories/${category.slug}#breadcrumb`,
      },
      mainEntity: {
        "@id": `${baseUrl}/categories/${category.slug}#itemlist`,
      },
      hasPart: childCategories.map((child) => ({
        "@type": "ItemList",
        "@id": `${baseUrl}/categories/${child.slug}`,
        name: child.name,
        description: child.description,
        url: `${baseUrl}/categories/${child.slug}`,
      })),
    };
    jsonLdArray.push(collectionJsonLd);
  }

  return jsonLdArray;
}

// Yardımcı fonksiyonlar
function calculateLowestPrice(variants: any[], taxRate: number): number {
  if (!variants?.length) return 0;

  return (
    variants.reduce((min, v) => {
      const price = calculatePrice(v.price, v.discount, taxRate).finalPrice;
      return Math.min(min, price);
    }, Infinity) || 0
  );
}

function calculateHighestPrice(variants: any[], taxRate: number): number {
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
export const sanitizeAndValidateJsonLd = (jsonLd): string => {
  try {
    // Önce yapısal doğrulama yap
    if (!validateJsonLdStructure(jsonLd)) {
      return "";
    }

    // JSON'ı string'e çevir
    const jsonString = JSON.stringify(jsonLd);

    // String'i sanitize et
    const sanitized = DOMPurify.sanitize(jsonString, {
      ALLOWED_TAGS: [], // HTML tag'lerine izin verme
      ALLOWED_ATTR: [], // HTML attribute'lerine izin verme
    });

    return sanitized;
  } catch (error) {
    console.error("Error processing JSON-LD:", error);
    return "";
  }
};