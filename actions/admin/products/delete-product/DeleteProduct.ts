"use server";

import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import { Prisma } from "@prisma/client";
export async function DeleteProduct(variantId: string) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { message: "Unauthorized", status: 403 };
    }
    if (!variantId) {
      return { message: "Variant ID gereklidir", status: 400 };
    }
    const existingVariant = await prisma.variant.findUnique({
      where: { id: variantId },
      include: {
        Image: true,
        product: {
          include: {
            Variant: {
              include: {
                Image: true,
              },
            },
            categories: true,
          },
        },
      },
    });
    if (!existingVariant) {
      return { message: "Variant bulunamadı", status: 404 };
    }
    const ASSETS_DIR = path.join(process.cwd(), "assets");
    const deleteImageFile = async (imageUrl: string) => {
      try {
        const baseImagePath = path.join(
          ASSETS_DIR,
          `${imageUrl.replace(/\.jpg$/, "")}`
        );
        await fs.unlink(`${baseImagePath}.jpg`).catch(() => {});
        await fs.unlink(`${baseImagePath}-thumbnail.jpg`).catch(() => {});
      } catch (error) {
        console.error(`Resim silinirken hata: ${error}`);
      }
    };
    await prisma.$transaction(async (tx) => {
      if (existingVariant.Image.length > 0) {
        await tx.image.deleteMany({
          where: {
            variantId: variantId,
          },
        });

        await Promise.all(
          existingVariant.Image.map((image) => deleteImageFile(image.url))
        );
      }

      if (existingVariant.product.Variant.length === 1) {
        // Tüm ürüne ait resimleri sil
        const allImages = existingVariant.product.Variant.flatMap(
          (v) => v.Image
        );
        await Promise.all(allImages.map((image) => deleteImageFile(image.url)));

        // Önce ürün-kategori ilişkilerini sil
        await tx.product.update({
          where: { id: existingVariant.product.id },
          data: {
            categories: {
              set: [],
            },
          },
        });

        await tx.product.delete({
          where: {
            id: existingVariant.product.id,
          },
        });
      } else {
        await tx.variant.delete({
          where: {
            id: variantId,
          },
        });
      }
    });
    return { message: "Başarıyla silindi", status: 200 };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { message: "Silinecek kayıt bulunamadı", status: 404 };
      }
      if (error.code === "P2003") {
        return {
          message: "Bu kayıt başka verilerle ilişkili olduğu için silinemiyor",
          status: 400,
        };
      }
      return {
        message: "Veritabanı işlemi sırasında hata oluştu",
        status: 400,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }

    console.error("Silme işlemi hatası:", error);
    return {
      message: "Silme işlemi sırasında bir hata oluştu",
      status: 500,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
}
