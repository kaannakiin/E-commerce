"use server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export async function DeleteImage(id: string) {
  try {
    const adminGuard = await isAdmin();
    if (!adminGuard) return { message: "Unauthorized", status: 401 };

    if (!id) {
      return { message: "Image ID is required", status: 400 };
    }
    const existingImage = await prisma.image.findUnique({
      where: {
        url: id.toString() + ".jpg",
      },
    });
    if (!existingImage) {
      return { message: "Image not found", status: 404 };
    }
    try {
      const publicPath = path.join(process.cwd(), "assets", `${id}.jpg`);
      const thumbnailPath = path.join(
        process.cwd(),
        "assets",
        `${id}-thumbnail.jpg`
      );
      await fs.unlink(publicPath);
      await fs.unlink(thumbnailPath);
    } catch (error) {
      return { message: "File system error", status: 500 };
    }
    await prisma.image.delete({
      where: {
        url: id + ".jpg",
      },
    });
    return {
      message: "Image deleted successfully",
      status: 201,
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      message: "An error occurred while deleting the image",
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
