"use server";
import { prisma } from "@/lib/prisma";
import { deleteAssetFileWithExtension } from "@/lib/deleteAssetFileWithExtension";

export async function DeleteHeroHeader(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!id) {
      return { success: false, message: "ID parametresi gereklidir" };
    }

    const header = await prisma.mainHeroSection.findUnique({
      where: { id },
      include: {
        image: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (!header) {
      return { success: false, message: "Böyle bir header bulunamadı" };
    }

    // Transaction ile silme işlemlerini gerçekleştir
    await prisma.$transaction(async (tx) => {
      // Önce header'ı sil
      await tx.mainHeroSection.delete({
        where: { id },
      });

      // Eğer image varsa, sonra image'i sil
      if (header.image) {
        await tx.image.delete({
          where: {
            id: header.image.id,
          },
        });

        // Dosya sisteminden sil
        await deleteAssetFileWithExtension(header.image.url, ["mp4"]);
      }
    });

    return {
      success: true,
      message: "Header başarıyla silindi",
    };
  } catch (error) {
    console.error("DeleteHeroHeader Error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Silme işlemi sırasında hata oluştu: ${error.message}`
          : "Beklenmeyen bir hata oluştu",
    };
  }
}
