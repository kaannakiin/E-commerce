"use server";

import { prisma } from "@/lib/prisma";
import { EditDiscountCodeSchema } from "@/zodschemas/authschema";
import { DiscountType } from "@prisma/client";

export async function EditDiscountCode(formData: FormData): Promise<{
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
    EditDiscountCodeSchema.parse(data);
    const code = await prisma.discountCode.findUnique({
      where: {
        id: formData.get("id") as string,
      },
    });
    if (!code) {
      return {
        success: false,
        message: "İndirim kodu bulunamadı.",
      };
    }
    await prisma.discountCode.update({
      where: {
        id: formData.get("id") as string,
      },
      data: {
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        allProducts: data.allProducts,
        limit: hasLimit ? data.limit : null,
        expiresAt: hasExpiryDate ? data.expiresAt : null,
        variants:
          data.allProducts !== true
            ? {
                set: [], // Bu satır tüm mevcut bağlantıları kaldırır
                // Sonra yeni bağlantıları ekle
                connect: data.variants.map((variantId: string) => ({
                  id: variantId,
                })),
              }
            : undefined,
      },
    });

    return {
      success: true,
      message: "İndirim kodu başarıyla güncellendi.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Bir hata oluştu. Lütfen yeniden deneyin.",
    };
  }
}
