"use server";

import { prisma } from "@/lib/prisma";
import { RecordImgToAsset } from "@/lib/recordImage";
import {
  EditProductSchema,
  EditProductSchemaType,
} from "@/zodschemas/authschema";
import { ZodError } from "zod";

export async function EditProduct(
  data: EditProductSchemaType,
  variantId: string,
  productId: string,
) {
  try {
    EditProductSchema.parse(data);
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const variant = await tx.variant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        throw new Error("Variant not found");
      }

      const images: { url: string[] } = { url: [] };

      if (data.variants[0].imageFile?.length > 0) {
        const processedImages = await RecordImgToAsset(
          data.variants[0].imageFile,
        );
        images.url = processedImages.map((image) => image.url);
      }

      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          description: data.description,
          taxRate: data.taxPrice,
          shortDescription: data.shortDescription,
          categories: {
            set: [],
            connect: data.categories.map((category: string) => ({
              id: category,
            })),
          },
        },
      });

      await tx.variant.update({
        where: { id: variantId },
        data: {
          price: data.variants[0].price,
          stock: data.variants[0].stock,
          discount: data.variants[0].discount,
          isPublished: data.variants[0].active,
          unit: "unit" in data.variants[0] ? data.variants[0].unit : "",
          value: String(data.variants[0].value),
          Image: {
            create: images.url.map((image) => ({
              url: image,
              alt: "Ürün resmi",
            })),
          },
        },
      });
    });
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { message: error.errors, status: 400 };
    }
    return { message: error.message, status: 500 };
  }
}
