import AddToCartButton from "@/components/AddToCartButton";
import ProductDetails from "@/components/InfoAccordion";
import ProductGallery from "@/components/ProductGallery";
import { calculatePrice } from "@/lib/calculatePrice";
import { formatPrice } from "@/lib/formatter";
import { getImageUrl } from "@/lib/getImageUrl";
import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { ColorSwatch } from "@mantine/core";
import { VariantType } from "@prisma/client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { FaClockRotateLeft } from "react-icons/fa6";
const feed = cache(async (slug, productSlug) => {
  const cat = await prisma.category.findUnique({
    where: {
      slug: slug,
      active: true,
    },
  });
  if (!cat) {
    return notFound();
  }
  const variant = await prisma.variant.findUnique({
    where: {
      slug: productSlug,
      isPublished: true,
    },
    select: {
      id: true,
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          taxRate: true,
        },
      },
      discount: true,
      price: true,
      stock: true,
      type: true,
      unit: true,
      value: true,
      Image: {
        select: {
          url: true,
          alt: true,
        },
      },
    },
  });
  if (!variant) {
    return notFound();
  }
  return variant;
});
//TO DO BUNLAR AYARLANACAK
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const deneme = await params;
  const variant = await feed(deneme.slug, deneme.productSlug);
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://yoursiteurl.com";
  const productUrl = `${SITE_URL}/${deneme.slug}/${deneme.productSlug}`;
  const price = variant.discount
    ? formatPrice(Number(variant.price) * (1 - variant.discount / 100))
    : formatPrice(Number(variant.price));

  return {
    title: `${variant.product.name.toUpperCase()} `,
    description: variant.product.description,

    openGraph: {
      title: variant.product.name,
      description: variant.product.description,
      url: productUrl,
      siteName: "WellnessClubByOyku",
      images: variant.Image.map((img) => ({
        url: getImageUrl(img.url) + "&width=800" || "",
        width: 800,
        height: 600,
        alt: img.alt || variant.product.name,
      })),
      locale: "tr_TR",
    },

    twitter: {
      card: "summary_large_image",
      title: variant.product.name,
      description: variant.product.description,
      images: variant.Image.map(
        (img) =>
          "https://5wy7hpmkox577zahlfqtbhjkzm.srv.us" +
            "?url" +
            `${img.url}` +
            "&width=100" || "",
      ),
    },

    alternates: {
      canonical: productUrl,
    },

    robots: {
      index: variant.stock > 0, // Stokta yoksa indekslemeyi engelleyebiliriz
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },

    other: {
      price: price,
      currency: "TRY",
      availability: variant.stock > 0 ? "in stock" : "out of stock",
      variant_type: variant.type,
      variant_value: variant.value,
      variant_unit: variant.unit,
    },
  };
}

const page = async (props: { params: Params }) => {
  const params = await props.params;
  const { slug, productSlug } = params;
  const variant = await feed(slug, productSlug);

  const ingredients = [
    "Vitamin C",
    "Hyaluronic Acid",
    "Niacinamide",
    "Vitamin E",
  ];
  return (
    <div className="mt-2 px-2 lg:px-10">
      {/* MAIN SECTION */}
      <div className="flex w-full flex-col items-start gap-2 lg:flex-row">
        <div className="w-full p-6 lg:w-3/4">
          <ProductGallery images={variant.Image.map((image) => image.url)} />
        </div>
        <div className="flex w-full flex-col space-y-6 p-6 lg:flex-1">
          {/* Ürün Başlığı */}
          <div className="space-y-2">
            <h1 className="text-3xl font-medium uppercase tracking-tight text-gray-900">
              {variant.product.name}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {variant.discount ? (
                  <>
                    <span className="text-2xl font-semibold text-primary-500">
                      {formatPrice(
                        calculatePrice(
                          variant.price,
                          variant.discount,
                          variant.product.taxRate,
                        ).finalPrice,
                      )}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(
                        calculatePrice(
                          variant.price,
                          variant.discount,
                          variant.product.taxRate,
                        ).originalPrice,
                      )}
                    </span>
                    <span className="rounded bg-green-50 px-2 py-1 text-sm font-medium text-green-600">
                      %
                      {
                        calculatePrice(
                          variant.price,
                          variant.discount,
                          variant.product.taxRate,
                        ).discount
                      }{" "}
                      İndirim
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-semibold text-primary-500">
                    {formatPrice(
                      calculatePrice(
                        variant.price,
                        variant.discount,
                        variant.product.taxRate,
                      ).finalPrice,
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ürün Açıklaması */}
          <div className="prose prose-sm text-gray-600">
            <p>{variant.product.description}</p>
          </div>

          {/* Varyant Bilgileri */}
          <div className="space-y-4">
            {variant.type === VariantType.COLOR && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Renk:</span>
                <ColorSwatch
                  color={variant.value}
                  className="h-6 w-6 rounded-full shadow-sm"
                />
              </div>
            )}

            {variant.type === VariantType.SIZE && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Beden:
                </span>
                <span className="rounded-md border px-3 py-1 text-sm">
                  {variant.value}
                </span>
              </div>
            )}

            {variant.type === VariantType.WEIGHT && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Ağırlık:
                </span>
                <span className="rounded-md border px-3 py-1 text-sm">
                  {variant.value} {variant.unit}
                </span>
              </div>
            )}
          </div>
          <AddToCartButton variant={variant} />
          {/* Ek Bilgiler */}
          <div className="flex flex-col gap-3 border-t pt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaClockRotateLeft className="text-primary-500" />
              <span>2-3 İş Günü İçinde Kargo</span>
            </div>
          </div>
          <ProductDetails
            description={variant.product.description}
            ingredients={ingredients}
          />
        </div>{" "}
      </div>
    </div>
  );
};

export default page;
