import { CustomFile } from "@/types/types";
import fs from "fs/promises";
import path from "path";
import { cleanupFiles } from "./recordImage";

interface ProcessedVideo {
  url: string;
  size: number;
  duration?: number;
  thumbnail?: string;
  metadata?: {
    width: number;
    height: number;
    codec: string;
    bitrate: number;
  };
}

export const RecordVideoToAsset = async (
  files: File[],
): Promise<ProcessedVideo[]> => {
  const ASSETS_DIR = path.join(process.cwd(), "assets");
  const THUMBNAILS_DIR = path.join(ASSETS_DIR, "thumbnails");
  const createdFiles: string[] = [];

  try {
    // Klasörleri oluştur
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    await fs.mkdir(THUMBNAILS_DIR, { recursive: true });

    const processedVideos: ProcessedVideo[] = [];

    for (const file of files) {
      let outputPath = "";
      try {
        // Video validasyonu
        if (!file.type.startsWith("video/")) {
          throw new Error("Invalid file type");
        }

        const buffer = Buffer.from(await (file as CustomFile).arrayBuffer());

        // Dosya adı oluşturma
        const fileName = generateFileName(file.name);
        outputPath = path.join(ASSETS_DIR, fileName);

        // Video optimizasyonu eklenebilir (ffmpeg ile)
        await fs.writeFile(outputPath, buffer);
        createdFiles.push(outputPath);

        const fileStats = await fs.stat(outputPath);

        // URL'de dosya uzantısını koruyoruz
        processedVideos.push({
          url: fileName, // Artık uzantıyı silmiyoruz
          size: fileStats.size,
          // Metadata eklenecek
        });
      } catch (error) {
        console.error(`Error processing video ${file.name}:`, error);
        await cleanupFiles([outputPath]);
      }
    }

    if (processedVideos.length === 0) {
      throw new Error("No videos were processed successfully");
    }

    return processedVideos;
  } catch (error) {
    await cleanupFiles(createdFiles);
    throw error;
  }
};
const generateFileName = (originalName: string): string => {
  // Dosya uzantısını al
  const extension = originalName.split(".").pop();

  // Orijinal dosya adını al (uzantısız)
  const baseName = originalName.split(".").slice(0, -1).join(".");

  // Tarihi formatla
  const date = new Date();
  const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

  // Random string oluştur
  const randomString = Math.random().toString(36).substring(2, 15);

  // Yeni dosya adını oluştur
  return `${baseName}-${dateString}-${randomString}.${extension}`;
};
