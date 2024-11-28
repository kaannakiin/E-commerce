"use server";
import { prisma } from "@/lib/prisma";
import { DiscountType } from "@prisma/client";

export async function DiscountCheck(
  code: string,
  VariantIds: string[],
): Promise<{
  success: boolean;
  message: string;
  discountType?: DiscountType;
  discountAmount?: number;
}> {
  try {
    if (!code) {
      return {
        success: false,
        message: "Kupon kodu boş olamaz.",
      };
    }
    const discount = await prisma.discountCode.findUnique({
      where: {
        code: code,
      },
      select: {
        discountAmount: true,
        discountType: true,
        active: true,
        allProducts: true,
        code: true,
        uses: true,
        expiresAt: true,
        limit: true,
        variants: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!discount) {
      return {
        success: false,
        message: "Kupon kodu geçersiz.",
      };
    }

    if (!discount.active) {
      return {
        success: false,
        message: "Kupon kodu aktif değil.",
      };
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return {
        success: false,
        message: "Kupon kodu süresi dolmuş.",
      };
    }

    if (discount.uses && discount.uses <= discount.limit) {
      return {
        success: false,
        message: "Kupon kodu limitine ulaşıldı.",
      };
    }

    // Eğer tüm ürünlerde geçerliyse direkt başarılı dön
    if (discount.allProducts) {
      return {
        success: true,
        message: "Kupon kodu başarıyla uygulandı.",
        discountType: discount.discountType,
        discountAmount: discount.discountAmount,
      };
    }

    const discountVariantIds = discount.variants.map((variant) => variant.id);
    const allVariantsValid = VariantIds.every((variantId) =>
      discountVariantIds.includes(variantId),
    );

    if (!allVariantsValid) {
      return {
        success: false,
        message: "Bu kupon kodu sepetinizdeki bazı ürünleri kapsamıyor.",
      };
    }

    return {
      success: true,
      message: "Kupon kodu başarıyla uygulandı.",
      discountType: discount.discountType,
      discountAmount: discount.discountAmount,
    };
  } catch (error) {
    console.error("Discount check error:", error);
    return {
      success: false,
      message: "Bir hata oluştu.",
    };
  }
}
