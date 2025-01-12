"use server";
import fs from "fs/promises";
import path from "path";
import { isAuthorized } from "./isAdminorSuperAdmin";
import { prisma } from "./prisma";

interface DeleteImageOptions {
  isLogo?: boolean;
  isFavicon?: boolean;
  type?: "category" | "variant" | "richText";
}

export async function DeleteImageToAsset(
  imageUrl: string,
  options: DeleteImageOptions = {},
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz Erişim" };
    }
    if (!imageUrl) {
      return { success: false, message: "Resim URL'si belirtilmedi" };
    }

    const { isLogo = false, isFavicon = false, type = "variant" } = options;
    const ASSETS_DIR = path.join(
      process.cwd(),
      type === "richText" ? "rich-tech-assets" : "assets",
    );

    const fileName = path.basename(imageUrl);
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    if (isLogo || isFavicon) {
      const filePath = path.join(ASSETS_DIR, fileName);
      try {
        await fs.unlink(filePath);
        return {
          success: true,
          message: `${isFavicon ? "Favicon" : "Logo"} başarıyla silindi`,
        };
      } catch (error) {
        if (error.code === "ENOENT") {
          return {
            success: false,
            message: `${isFavicon ? "Favicon" : "Logo"} bulunamadı`,
          };
        }
        throw error;
      }
    }

    if (type === "richText") {
      const filePath = path.join(ASSETS_DIR, fileName);
      try {
        await fs.unlink(filePath);
        await prisma.richTextImageGallery.delete({
          where: {
            url: fileName,
          },
        });
        return {
          success: true,
          message: "Rich text resmi başarıyla silindi",
        };
      } catch (error) {
        if (error.code === "ENOENT") {
          return { success: false, message: "Rich text resmi bulunamadı" };
        }
        throw error;
      }
    }

    const mainFilePath = path.join(ASSETS_DIR, fileName);
    const thumbnailPath = path.join(
      ASSETS_DIR,
      `${fileNameWithoutExt}-thumbnail.webp`,
    );
    const ogImagePath = path.join(ASSETS_DIR, `${fileNameWithoutExt}-og.webp`);

    const filesToDelete = [mainFilePath, thumbnailPath, ogImagePath];
    let deletedCount = 0;

    for (const filePath of filesToDelete) {
      try {
        await fs.unlink(filePath);
        deletedCount++;
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error(`Dosya silme hatası ${filePath}:`, error);
        }
      }
    }

    return {
      success: deletedCount > 0,
      message:
        deletedCount > 0
          ? "Resim ve ilişkili dosyalar başarıyla silindi"
          : "Silinecek dosya bulunamadı",
    };
  } catch (error) {
    console.error("DeleteImage hatası:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Dosya silme işlemi başarısız",
    };
  }
}
