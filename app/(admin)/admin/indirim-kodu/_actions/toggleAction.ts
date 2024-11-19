"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function switchActive(discountId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const discount = await prisma.discountCode.findUnique({
      where: {
        id: discountId,
      },
    });
    if (!discount) {
      return {
        success: false,
        message: "İndirim kodu bulunamadı",
      };
    }
    if (discount.expiresAt && discount.expiresAt < new Date()) {
      return {
        success: false,
        message: "Süresi geçmiş bir indirim kodunu aktifleştiremezsiniz",
      };
    }
    if (discount.limit !== null) {
      if (discount.limit <= discount.uses) {
        return {
          success: false,
          message: "Limiti dolduğu için indirim kodunu aktifleştiremezsiniz",
        };
      }
    }

    if (discount.active) {
      await prisma.discountCode.update({
        where: {
          id: discountId,
        },
        data: {
          active: false,
        },
      });
    } else {
      await prisma.discountCode.update({
        where: {
          id: discountId,
        },
        data: {
          active: true,
        },
      });
    }
    revalidatePath("/admin/indirim-kodu");
    return {
      success: true,
      message: "Indirim kodu durumu başarıyla değiştirildi",
    };
  } catch (error) {}
}
export async function deleteDiscount(discountId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const discount = await prisma.discountCode.findUnique({
      where: {
        id: discountId,
      },
      select: {
        uses: true,
        active: true,
        variants: {
          select: { id: true },
        },
      },
    });
    if (discount.uses > 0) {
      return {
        success: false,
        message: "Bu indirim kodu kullanıldığı için silemezsiniz",
      };
    }
    if (discount.active) {
      return {
        success: false,
        message: "Aktif bir indirim kodunu silemezsiniz. Önce pasife alın.",
      };
    }
    await prisma.$transaction(async (tx) => {
      // Önce variant ilişkilerini kaldır
      await tx.discountCode.update({
        where: { id: discountId },
        data: {
          variants: {
            disconnect: discount.variants.map((v) => ({ id: v.id })),
          },
        },
      });

      await tx.discountCode.delete({
        where: { id: discountId },
      });
    });
    revalidatePath("/admin/indirim-kodu");
    return {
      success: true,
      message: "Indirim kodu başarıyla silindi",
    };
  } catch (error) {
    return {
      success: false,
      message: "Bilinmeyen bir hata oluştu",
    };
  }
}
