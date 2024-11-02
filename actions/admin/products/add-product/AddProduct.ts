"use server";

import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecordImgToAsset } from "@/lib/recordImage";
import { slugify } from "@/utils/slugify";
import {
  AddProductSchemaType,
  AddProductSchema,
} from "@/zodschemas/authschema";
import { Role, VariantType } from "@prisma/client";
import { ZodError } from "zod";

export async function AddProduct(data: AddProductSchemaType) {
  try {
    const session = await isAdmin();
    if (!session) {
      return { error: "You are not authorized to perform this action" };
    }
    const { name, description, shortDescription, categories, variants } =
      AddProductSchema.parse(data);

    const categoryCheck = await prisma.category.findMany({
      where: {
        id: {
          in: categories,
        },
      },
    });
    if (categoryCheck.length !== categories.length) {
      return { error: "One or more categories not found" };
    }
    const existingVariantSlugs = await prisma.variant.findMany({
      where: {
        slug: {
          in: variants.map((variant) => {
            const variantPart =
              variant.type === "WEIGHT"
                ? `${variant.value}${variant.unit}`
                : `${variant.type}-${variant.value}`;
            return slugify(`${name}-${variantPart}`);
          }),
        },
      },
    });
    if (existingVariantSlugs.length > 0) {
      return { error: "Duplicate variant slugs found" };
    }
    await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          name,
          shortDescription,
          description,
          categories: {
            connect: categories.map((category) => ({ id: category })),
          },
          Variant: {
            create: await Promise.all(
              variants.map(async (variant) => {
                const processedImages = await RecordImgToAsset(
                  variant.imageFile
                ).catch((error) => {
                  throw new Error(`Failed to process images: ${error.message}`);
                });

                const baseVariant = {
                  type: variant.type as VariantType,
                  price: variant.price,
                  stock: variant.stock,
                  isPublished: variant.active,
                  discount: variant.discount,
                  Image: {
                    create: processedImages.map((item) => ({
                      url: item.url,
                    })),
                  },
                  slug: (() => {
                    const variantPart =
                      variant.type === "WEIGHT"
                        ? `${variant.value}${variant.unit}`
                        : `${variant.type}-${variant.value}`;
                    return slugify(`${name}-${variantPart}`);
                  })(),
                  value: variant.value.toString(),
                };

                if (!Object.values(VariantType).includes(variant.type)) {
                  throw new Error(`Invalid variant type: ${variant.type}`);
                }

                if (variant.type === "WEIGHT") {
                  if (!variant.unit) {
                    throw new Error("Unit is required for weight variants");
                  }
                  return { ...baseVariant, unit: variant.unit };
                }

                return baseVariant;
              })
            ),
          },
        },
      });
      return createdProduct;
    });
    return { success: true };
  } catch (error) {
    console.error("AddProduct", error);
    if (error instanceof ZodError) {
      return { error: error.errors };
    }
    return { error: "An error occurred while adding the product" };
  }
}
