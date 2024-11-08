import { CustomFile } from "@/types/types";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

interface ProcessedVideo {
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

export const RecordVideoToAsset = async (
  files: File[]
): Promise<ProcessedVideo[]> => {
  const ASSETS_DIR = path.join(process.cwd(), "assets");
  const createdFiles: string[] = [];

  try {
    // Assets klasörünü oluştur
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    const processedVideos: ProcessedVideo[] = [];

    for (const file of files) {
      let outputPath = "";
      try {
        // Video buffer'ını oku
        const buffer = Buffer.from(await (file as CustomFile).arrayBuffer());

        // Dosya adını oluştur
        const createdAt = new Date();
        const timestamp = createdAt
          .toISOString()
          .replace(/[:.-]/g, "")
          .replace(/Z/g, "");
        const uuid = randomUUID();
        const fileName = `${timestamp}-${uuid}.mp4`;

        // Video dosyasını kaydet
        outputPath = path.join(ASSETS_DIR, fileName);
        await fs.writeFile(outputPath, buffer);
        createdFiles.push(outputPath);

        // İşlenmiş video bilgisini ekle
        processedVideos.push({
          url: `${fileName.replace(/\.mp4$/, "")}`,
        });
      } catch (error) {
        console.error(`Error processing video ${file.name}:`, error);
        if (outputPath) {
          await cleanupFiles([outputPath]);
        }
      }
    }

    // Hiç video işlenmediyse hata fırlat
    if (processedVideos.length === 0) {
      await cleanupFiles(createdFiles);
      throw new Error("No videos were processed successfully");
    }

    return processedVideos;
  } catch (error) {
    await cleanupFiles(createdFiles);
    console.error("Fatal error in RecordVideoToAsset:", error);
    throw error;
  }
};
