"use server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";

async function unlinkWithRetry(filePath: string, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
}

function getBaseFilename(filename: string) {
  const match = filename.match(/^\d{2}-\d{2}-\d{4}-[a-zA-Z0-9]+/);
  return match ? match[0] : filename;
}

export async function DeleteImgToProduct(id: string) {
  try {
    const session = await isAuthorized();
    if (
      !session ||
      (session?.role !== "ADMIN" && session?.role !== "SUPERADMIN")
    ) {
      return { success: false, message: "Unauthorized" };
    }

    if (!id) {
      return { message: "Image ID is required", status: 400 };
    }

    const existingImage = await prisma.image.findUnique({
      where: {
        url: id.toString(),
      },
    });

    if (!existingImage) {
      return { message: "Image not found", status: 404 };
    }

    try {
      const assetsDir = path.join(process.cwd(), "assets");
      const files = await fs.readdir(assetsDir);

      // Get base filename from id
      const baseFilename = getBaseFilename(id);

      // Find all files that match the base filename pattern
      const matchingFiles = files.filter((file) => {
        const fileBase = getBaseFilename(file);
        const matches = fileBase === baseFilename;

        return matches;
      });

      // Delete all matching files with retry logic
      const deletionResults = await Promise.allSettled(
        matchingFiles.map(async (file) => {
          const filePath = path.join(assetsDir, file);
          try {
            await unlinkWithRetry(filePath);
            return { success: true, file };
          } catch (error) {
            console.error(`Failed to delete ${file} after retries:`, error);
            return { success: false, file, error };
          }
        }),
      );

      // Log results
      deletionResults.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Failed to delete:", result.reason);
        } else {
        }
      });
    } catch (error) {
      console.error("Error during file deletion:", error);
    }

    // Delete database record
    await prisma.image.delete({
      where: {
        url: id,
      },
    });

    return {
      message: "Images deleted successfully",
      status: 201,
      success: true,
    };
  } catch (error) {
    return {
      message: "An error occurred while deleting the images",
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
