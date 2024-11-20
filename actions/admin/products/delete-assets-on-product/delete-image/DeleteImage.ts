"use server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export async function DeleteImgToProduct(id: string) {
  try {
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
      const publicPath = path.join(process.cwd(), "assets", `${id}.jpg`);
      const thumbnailPath = path.join(
        process.cwd(),
        "assets",
        `${id}-thumbnail.jpg`,
      );
      await fs.unlink(publicPath);
      await fs.unlink(thumbnailPath);
    } catch (error) {}
    await prisma.image.delete({
      where: {
        url: id,
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
