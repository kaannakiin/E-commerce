import { CustomFile } from "@/types/types";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

interface ProcessedImage {
  url: string;
}

async function cleanupFiles(files: string[]) {
  for (const file of files) {
    try {
      if (file) {
        await fs.access(file);
        await fs.unlink(file);
        console.log(`Cleaned up file: ${file}`);
      }
    } catch (error) {
      console.warn(`Cleanup warning for ${file}:`, error);
    }
  }
}

export const RecordImgToAsset = async (
  files: File[]
): Promise<ProcessedImage[]> => {
  const ASSETS_DIR = path.join(process.cwd(), "assets");

  const createdFiles: string[] = [];

  try {
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    const processedImages: ProcessedImage[] = [];

    for (const file of files) {
      let outputPath = "";
      let thumbnailPath = "";
      try {
        const buffer = Buffer.from(await (file as CustomFile).arrayBuffer());
        const createdAt = new Date();
        const timestamp = createdAt
          .toISOString()
          .replace(/[:.-]/g, "")
          .replace(/Z/g, "");
        const uuid = randomUUID();

        const fileName = `${timestamp}-${uuid}.jpg`;
        const thumbnailName = `${timestamp}-${uuid}-thumbnail.jpg`;

        outputPath = path.join(ASSETS_DIR, fileName);
        thumbnailPath = path.join(ASSETS_DIR, thumbnailName);

        await sharp(buffer).jpeg({ quality: 80 }).toFile(outputPath);

        createdFiles.push(outputPath);

        await sharp(buffer).resize(10).blur(1).toFile(thumbnailPath);

        createdFiles.push(thumbnailPath);

        processedImages.push({
          url: `${fileName.replace(/\.jpg$/, "")}`,
        });
      } catch (error) {
        console.error(`Error processing image ${file.name}:`, error);
        if (outputPath || thumbnailPath) {
          await cleanupFiles([outputPath, thumbnailPath]);
        }
      }
    }

    if (processedImages.length === 0) {
      await cleanupFiles(createdFiles);
      throw new Error("No images were processed successfully");
    }

    return processedImages;
  } catch (error) {
    await cleanupFiles(createdFiles);
    console.error("Fatal error in RecordImgToAsset:", error);
    throw error;
  }
};
