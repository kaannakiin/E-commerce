import fs from "fs/promises";
import path from "path";

interface DeleteImageOptions {
  isLogo?: boolean;
  maxRetries?: number;
  retryDelay?: number;
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
        await sleep(retryDelay * attempt); // Her denemede bekleyeceğimiz süreyi artırıyoruz
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

export async function DeleteImage(
  imageUrl: string,
  options: DeleteImageOptions = {},
): Promise<{ success: boolean; message: string }> {
  const { isLogo = false, maxRetries = 3, retryDelay = 100 } = options;

  if (!imageUrl) {
    return { success: false, message: "No image URL provided" };
  }

  try {
    const ASSETS_DIR = path.join(process.cwd(), "assets");

    const fileName = path.basename(imageUrl);
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const extension = path.extname(imageUrl);

    const mainFilePath = path.join(ASSETS_DIR, fileName);
    const thumbnailPath = path.join(
      ASSETS_DIR,
      `${fileNameWithoutExt}-thumbnail${extension}`,
    );

    const filesToDelete = isLogo
      ? [mainFilePath, thumbnailPath]
      : [
          mainFilePath,
          thumbnailPath,
          path.join(ASSETS_DIR, `${fileNameWithoutExt}-og${extension}`),
        ];

    const deletionResults = await Promise.all(
      filesToDelete.map((filePath) =>
        unlinkWithRetry(filePath, maxRetries, retryDelay),
      ),
    );

    const anySuccessful = deletionResults.some((result) => result);

    if (anySuccessful) {
      return {
        success: true,
        message: `${isLogo ? "Logo" : "Image"} and its associated files were deleted`,
      };
    } else {
      return {
        success: false,
        message: `Failed to delete ${isLogo ? "logo" : "image"} files after multiple attempts`,
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
