import fs from "fs/promises";
import path from "path";

export async function deleteAssetFileWithExtension(
  filePath: string,
  fileExtensions: string[] = []
): Promise<{ success: boolean; message: string }> {
  try {
    const ASSETS_DIR = path.join(process.cwd(), "assets");

    const deleteFileWithExtensions = async (basePath: string) => {
      try {
        // Eğer uzantı listesi boşsa, dosyayı direkt verilen uzantıyla sil
        if (fileExtensions.length === 0) {
          await fs.unlink(basePath).catch(() => {});
          return;
        }

        for (const ext of fileExtensions) {
          const fullPath = `${basePath}.${ext.replace(/^\./, "")}`;
          await fs.unlink(fullPath).catch(() => {});

          const thumbnailPath = `${basePath}-thumbnail.${ext.replace(
            /^\./,
            ""
          )}`;
          await fs.unlink(thumbnailPath).catch(() => {});
        }
      } catch (error) {
        console.error(`Dosya silinirken hata oluştu: ${error}`);
      }
    };

    // Dosya yolundan uzantıyı çıkar
    const baseFilePath = path.join(
      ASSETS_DIR,
      filePath.replace(/\.[^/.]+$/, "")
    );

    await deleteFileWithExtensions(baseFilePath);

    return {
      success: true,
      message: "Dosya(lar) başarıyla silindi",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}
