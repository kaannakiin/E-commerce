"use server";
import { DeleteImageToAsset } from "@/lib/deleteImageFile";
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
    // Schema validation
    const {
      title,
      description,
      favicon,
      googleId,
      googleVerification,
      logo,
      themeColor1,
      themeColor2,
    } = SocialMediaPreviewSchema.parse(data);

    // Process images in parallel if they exist
    const [faviconResult, logoResult] = await Promise.all([
      favicon ? processImages(favicon, { isFavicon: true }) : null,
      logo
        ? processImages(logo, {
            quality: 80,
            ogImageOptions: {
              width: 1200,
              height: 630,
              format: "jpeg",
              quality: 80,
            },
          })
        : null,
    ]);

    const faviconUrl = faviconResult?.[0]?.url;
    const logoUrl = logoResult?.[0]?.url;

    // Database operations
    await prisma.$transaction(async (tx) => {
      const existingSettings = await tx.mainSeoSettings.findFirst({
        select: {
          id: true,
          image: { select: { url: true } },
          favicon: { select: { url: true } },
        },
      });

      // Prepare common data object
      const commonData = {
        description,
        title,
        googleId,
        googleVerification,
        themeColor: themeColor1,
        themeColorSecondary: themeColor2,
        ...(faviconUrl && {
          favicon: {
            create: { url: faviconUrl },
          },
        }),
        ...(logoUrl && {
          image: {
            create: { url: logoUrl },
          },
        }),
      };

      if (existingSettings) {
        // Delete existing images if they exist
        const deletePromises = [];
        if (existingSettings.image?.url) {
          deletePromises.push(
            DeleteImageToAsset(existingSettings.image.url, { isLogo: true }),
          );
        }
        if (existingSettings.favicon?.url) {
          deletePromises.push(
            DeleteImageToAsset(existingSettings.favicon.url, {
              isFavicon: true,
            }),
          );
        }

        if (deletePromises.length > 0) {
          try {
            await Promise.all(deletePromises);
          } catch (error) {
            console.error("Error deleting existing images:", error);
            throw new Error("Failed to delete existing images");
          }
        }

        // Update existing record
        await tx.mainSeoSettings.update({
          where: { id: existingSettings.id },
          data: commonData,
        });
      } else {
        // Create new record
        await tx.mainSeoSettings.create({
          data: commonData,
        });
      }
    });

    return {
      success: true,
      message: "Tema başarıyla güncellendi",
    };
  } catch (error) {
    console.error("Tema güncellenirken hata:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Tema güncellenirken bir hata oluştu",
    };
  }
}
export async function DeteleSeoImage(
  url: string,
  type: "favicon" | "logo",
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!url) {
      return { success: false, message: "Resim bulunamadı" };
    }

    if (type === "favicon") {
      await prisma.image.delete({
        where: { url },
      });

      const deleteResult = await DeleteImageToAsset(url, { isFavicon: true });
      return deleteResult.success
        ? { success: true, message: "Resim başarıyla silindi" }
        : { success: false, message: "Resim silinirken bir hata oluştu" };
    }

    if (type === "logo") {
      await prisma.image.delete({
        where: { url },
      });

      const deleteResult = await DeleteImageToAsset(url, { isLogo: true });
      return deleteResult.success
        ? { success: true, message: "Resim başarıyla silindi" }
        : { success: false, message: "Resim silinirken bir hata oluştu" };
    }

    return { success: false, message: "Geçersiz resim tipi" };
  } catch (error) {
    console.error("Image deletion error:", error);
    return { success: false, message: "Resim silinirken bir hata oluştu" };
  }
}
