import fs from "fs/promises";
import path from "path";

interface DeleteImageOptions {
  isLogo?: boolean;
  isFavicon?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  variants?: string[]; // Favicon varyantları için
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function unlinkWithRetry(
  filePath: string,
  maxRetries: number = 3,
  retryDelay: number = 100,
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        return true; // Dosya zaten yok, başarılı sayılır
      }

      if (error.code === "EBUSY" && attempt < maxRetries) {
        await sleep(retryDelay * attempt);
        continue;
      }

      if (attempt === maxRetries) {
        console.warn(
          `Failed to delete ${filePath} after ${maxRetries} attempts:`,
          error,
        );
        return false;
      }
    }
  }
  return false;
}

export async function DeleteImageToAsset(
  imageUrl: string,
  options: DeleteImageOptions = {},
): Promise<{ success: boolean; message: string }> {
  const {
    isLogo = false,
    isFavicon = false,
    maxRetries = 3,
    retryDelay = 100,
    variants = [],
  } = options;

  if (!imageUrl) {
    return { success: false, message: "No image URL provided" };
  }

  try {
    const ASSETS_DIR = path.join(process.cwd(), "assets");
    const fileName = path.basename(imageUrl);
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const extension = path.extname(imageUrl);

    // Temel dosya yolları
    const mainFilePath = path.join(ASSETS_DIR, fileName);
    const thumbnailPath = path.join(
      ASSETS_DIR,
      `${fileNameWithoutExt}-thumbnail${extension}`,
    );

    let filesToDelete: string[] = [];

    if (isFavicon) {
      // Ana favicon ve thumbnail
      filesToDelete.push(mainFilePath, thumbnailPath);

      // Favicon varyantlarını ekle
      if (variants.length > 0) {
        filesToDelete.push(
          ...variants.map((variant) => path.join(ASSETS_DIR, variant)),
        );
      } else {
        // Varsayılan favicon boyutları (variants verilmemişse)
        const defaultSizes = [
          "16x16",
          "32x32",
          "48x48",
          "180x180",
          "192x192",
          "512x512",
        ];
        filesToDelete.push(
          ...defaultSizes.map((size) =>
            path.join(ASSETS_DIR, `${fileNameWithoutExt}-${size}.png`),
          ),
        );
      }
    } else if (isLogo) {
      // Logo ve thumbnail
      filesToDelete = [mainFilePath, thumbnailPath];
    } else {
      // Normal resim, thumbnail ve og image
      filesToDelete = [
        mainFilePath,
        thumbnailPath,
        path.join(ASSETS_DIR, `${fileNameWithoutExt}-og.jpeg`),
      ];
    }

    const deletionResults = await Promise.all(
      filesToDelete.map((filePath) =>
        unlinkWithRetry(filePath, maxRetries, retryDelay),
      ),
    );

    const anySuccessful = deletionResults.some((result) => result);
    const allSuccessful = deletionResults.every((result) => result);

    if (anySuccessful) {
      return {
        success: true,
        message: allSuccessful
          ? `${isFavicon ? "Favicon" : isLogo ? "Logo" : "Image"} and all associated files were deleted`
          : `${isFavicon ? "Favicon" : isLogo ? "Logo" : "Image"} and some associated files were deleted`,
      };
    } else {
      return {
        success: false,
        message: `Failed to delete ${isFavicon ? "favicon" : isLogo ? "logo" : "image"} files after multiple attempts`,
      };
    }
  } catch (error) {
    console.error("Error in DeleteImage:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete image",
    };
  }
}
