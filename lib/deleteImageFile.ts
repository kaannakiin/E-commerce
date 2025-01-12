"use server";
import fs from "fs/promises";
import path from "path";

interface DeleteImageOptions {
  isLogo?: boolean;
  isFavicon?: boolean;
}

export async function DeleteImageToAsset(
  imageUrl: string,
  options: DeleteImageOptions = {},
): Promise<{ success: boolean; message: string }> {
  const { isLogo = false, isFavicon = false } = options;

  if (!imageUrl) {
    return { success: false, message: "No image URL provided" };
  }

  try {
    const ASSETS_DIR = path.join(process.cwd(), "assets");
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
          console.error(`Error deleting ${filePath}:`, error);
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
    console.error("Error in DeleteImage:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Dosya silme işlemi başarısız",
    };
  }
}
