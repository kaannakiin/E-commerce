"use server";
import { DeleteImage } from "@/lib/deleteImageFile";
import { prisma } from "@/lib/prisma";

export async function DeleteCategories(
  slug: string
): Promise<{ success: boolean; message: string }> {
  try {
    return await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { slug },
        include: {
          Image: true,
        },
      });

      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }
      const deleteResults = await Promise.all(
        category.Image.map(async (image) => {
          if (image.url) {
            const result = await DeleteImage(image.url);
            return { url: image.url, ...result };
          }
          return null;
        })
      );
      const failedDeletes = deleteResults.filter(
        (result) => result && !result.success
      );
      if (failedDeletes.length > 0) {
        console.error("Failed to delete some images:", failedDeletes);
      }
      await tx.image.deleteMany({
        where: {
          categoryId: category.id,
        },
      });

      await tx.category.delete({
        where: { slug },
      });
      const successCount = deleteResults.filter((r) => r && r.success).length;
      const failCount = failedDeletes.length;

      return {
        success: true,
        message: `Category and ${successCount} images successfully deleted${
          failCount > 0 ? ` (${failCount} images failed to delete)` : ""
        }`,
      };
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
