"use server";
import { prisma } from "@/lib/prisma";
import { AddDiscountCodeSchema } from "@/zodschemas/authschema";
import { DiscountType } from "@prisma/client";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

export async function createNewDiscountCode(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const hasLimit = formData.get("hasLimit") === "1";
    const hasExpiryDate = formData.get("hasExpiryDate") === "1";
    const allProducts = formData.get("allProducts") === "1";

    let limitValue = null;
    let expiresAtValue = null;

    if (hasLimit) {
      const limitStr = formData.get("limit")?.toString();
      if (limitStr) {
        limitValue = parseInt(limitStr);
      }
    }

    if (hasExpiryDate) {
      const expiresAtStr = formData.get("expiresAt")?.toString();
      if (expiresAtStr) {
        expiresAtValue = new Date(expiresAtStr);
      }
    }
    const data = {
      code: (formData.get("code") as string)?.trim().toUpperCase(),
      discountType: formData.get("discountType") as DiscountType,
      discountAmount: parseInt(formData.get("discountAmount") as string),
      active: formData.get("active") === "1",
      allProducts: allProducts,
      hasLimit: hasLimit,
      hasExpiryDate: hasExpiryDate,
      limit: limitValue,
      expiresAt: expiresAtValue,
      variants:
        !allProducts && formData.get("variants")
          ? JSON.parse(formData.get("variants") as string)
          : [],
    };

    AddDiscountCodeSchema.parse(data);
    const checkCode = await prisma.discountCode.findUnique({
      where: {
        code: data.code,
      },
    });

    if (checkCode) {
      return {
        success: false,
        message: "Bu indirim kodu zaten kullanımda",
      };
    }

    if (!data.allProducts && data.variants.length > 0) {
      const variantsExist = await prisma.variant.findMany({
        where: {
          AND: {
            id: {
              in: data.variants,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (variantsExist.length !== data.variants.length) {
        return {
          success: false,
          message: "Seçilen ürün varyantlarından bazıları bulunamadı",
        };
      }
    }

    // Transaction kullan
    await prisma.$transaction(async (tx) => {
      await tx.discountCode.create({
        data: {
          code: data.code,
          discountType: data.discountType,
          discountAmount: data.discountAmount,
          active: data.active,
          expiresAt: data.hasExpiryDate ? data.expiresAt : null,
          limit: data.hasLimit ? data.limit : null,
          allProducts: data.allProducts,
          variants:
            data.allProducts !== true
              ? {
                  connect: data.variants.map((variantId: string) => ({
                    id: variantId,
                  })),
                }
              : undefined,
        },
      });
    });
    return {
      success: true,
      message: "İndirim kodu başarıyla oluşturuldu",
    };
  } catch (error) {
    console.error("Error creating discount code:", error);

    if (error instanceof ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      return {
        success: false,
        message: `Validasyon hatası: ${errorMessage}`,
      };
    }

    // Prisma hataları için özel mesajlar
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Bu indirim kodu zaten kullanımda",
      };
    }

    return {
      success: false,
      message: "İndirim kodu oluşturulurken bir hata oluştu",
    };
  }
}
