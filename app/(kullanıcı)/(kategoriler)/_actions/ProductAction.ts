"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IdForEverythingType } from "@/zodschemas/authschema";
import { revalidatePath } from "next/cache";

export async function AddFavorite(
  id: IdForEverythingType,
): Promise<{ success: boolean; message: string; isMustLogin?: boolean }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Giriş yapmalısınız",
        isMustLogin: true,
      };
    }

    const variant = await prisma.variant.findUnique({
      where: { id, softDelete: false },
    });
    if (!variant) {
      return {
        success: false,
        message: "Ürün bulunamadı",
      };
    }
    const existingFavorite = await prisma.favoriteVariants.findUnique({
      where: {
        userId_variantId: {
          userId: session.user.id,
          variantId: id,
        },
      },
    });
    if (existingFavorite) {
      await prisma.favoriteVariants.update({
        where: {
          id: existingFavorite.id,
        },
        data: {
          deletedAt: existingFavorite.deletedAt ? null : new Date(),
        },
      });
      revalidatePath("/hesabim/favoriler");
      return {
        success: true,
        message: existingFavorite.deletedAt
          ? "Favorilere eklendi"
          : "Favorilerden çıkarıldı",
      };
    }

    await prisma.favoriteVariants.create({
      data: {
        userId: session.user.id,
        variantId: id,
      },
    });

    return {
      success: true,
      message: "Ürün favorilere eklendi",
    };
  } catch (error) {
    console.error("AddFavorite error:", error);
    return {
      success: false,
      message: "Bir hata oluştu",
    };
  }
}
