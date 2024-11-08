import fs from "fs/promises";
import path from "path";
export async function DeleteImage(
  imageUrl
): Promise<{ success: boolean; message: string }> {
  try {
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
        console.error(`Error deleting image: ${error}`);
      }
    };
    await deleteImageFile(imageUrl);
    return { success: true, message: "Image successfully deleted" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
