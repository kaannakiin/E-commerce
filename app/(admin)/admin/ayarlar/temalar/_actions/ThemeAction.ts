"use server";
import { DeleteImage } from "@/lib/deleteImageFile";
import { prisma } from "@/lib/prisma";
import { processImages } from "@/lib/recordImage";
import {
  SocialMediaPreviewSchema,
  SocialMediaPreviewType,
} from "@/zodschemas/authschema";

export async function EditTheme(
  data: SocialMediaPreviewType,
): Promise<{ success: boolean; message: string }> {
  try {
    const { logo, title, description, themeColor } =
      SocialMediaPreviewSchema.parse(data);
    let oldImageUrl: string | null = null;
    await prisma.$transaction(async (tx) => {
      const existingTheme = await tx.mainSeoSettings.findFirst({
        include: { image: true },
      });

      if (existingTheme) {
        if (logo) {
          oldImageUrl = existingTheme.image?.url || null;

          const newImageUrl = await processImages(logo).then(
            (res) => res[0].url,
          );
          await tx.mainSeoSettings.update({
            where: { id: existingTheme.id },
            data: {
              description,
              image: {
                delete: existingTheme.imageId ? true : false, // Eski image'ı sil
                create: {
                  url: newImageUrl,
                },
              },
              themeColor,
              title,
            },
          });
        } else {
          await tx.mainSeoSettings.update({
            where: { id: existingTheme.id },
            data: {
              description,
              themeColor,
              title,
            },
          });
        }
      } else {
        if (!logo) {
          throw new Error("İlk oluşturmada logo zorunludur");
        }
        await tx.mainSeoSettings.create({
          data: {
            description,
            image: {
              create: {
                url: await processImages(logo).then((res) => res[0].url),
              },
            },
            themeColor,
            title,
          },
        });
      }
    });

    if (oldImageUrl) {
      try {
        await DeleteImage(oldImageUrl);
      } catch (error) {
        console.error("Eski resim silinirken hata:", {
          url: oldImageUrl,
          error: error instanceof Error ? error.message : error,
        });
      }
    }

    return {
      success: true,
      message: "Tema başarıyla güncellendi",
    };
  } catch (error) {
    console.error("Tema güncellenirken hata:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: "Tema güncellenirken bir hata oluştu",
    };
  }
}
export async function DeteleSeoImage(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!id) {
      return {
        success: false,
        message: "ID gereklidir",
      };
    }

    // Önce mevcut kaydı ve image bilgisini alalım
    const currentRecord = await prisma.mainSeoSettings.findUnique({
      where: { id },
      include: {
        image: true,
      },
    });

    if (!currentRecord?.imageId) {
      return {
        success: false,
        message: "Görsel bulunamadı",
      };
    }

    await prisma.mainSeoSettings.update({
      where: { id },
      data: {
        imageId: null,
      },
    });

    // Sonra Image kaydını silelim
    if (currentRecord.image) {
      await prisma.image.delete({
        where: {
          id: currentRecord.imageId,
        },
      });

      // En son fiziksel dosyayı silelim
      await DeleteImage(currentRecord.image.url);
    }

    return {
      success: true,
      message: "Görsel başarıyla silindi",
    };
  } catch (error) {
    console.error("Görsel silinirken hata:", error);
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: "Görsel silinirken bir hata oluştu",
    };
  }
}
