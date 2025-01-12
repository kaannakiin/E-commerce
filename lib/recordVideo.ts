import { CustomFile } from "@/types/types";
import fs from "fs/promises";
import path from "path";

interface VideoResponse {
  success: boolean;
  message: string;
  fileName?: string;
}

interface VideoResponse {
  success: boolean;
  message: string;
  fileName?: string;
}

export const RecordVideoToAsset = async (
  files: File[],
): Promise<VideoResponse> => {
  const ASSETS_DIR = path.join(process.cwd(), "assets");
  const THUMBNAILS_DIR = path.join(ASSETS_DIR, "thumbnails");
  const createdFiles: string[] = [];

  try {
    // Klasörleri oluştur
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    await fs.mkdir(THUMBNAILS_DIR, { recursive: true });

    if (files.length === 0) {
      return {
        success: false,
        message: "Dosya bulunamadı",
      };
    }

    const file = files[0]; // İlk dosyayı al
    let outputPath = "";

    try {
      // Video validasyonu
      if (!file.type.startsWith("video/")) {
        return {
          success: false,
          message: "Geçersiz dosya formatı",
        };
      }

      const buffer = Buffer.from(await (file as CustomFile).arrayBuffer());

      // Dosya adı oluşturma
      const fileName = generateFileName(file.name);
      outputPath = path.join(ASSETS_DIR, fileName);

      // Video dosyasını kaydet
      await fs.writeFile(outputPath, buffer);
      createdFiles.push(outputPath);

      return {
        success: true,
        message: "Video başarıyla kaydedildi",
        fileName: fileName,
      };
    } catch (error) {
      console.error(`Error processing video ${file.name}:`, error);
      return {
        success: false,
        message: "Video işlenirken bir hata oluştu",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "İşlem sırasında bir hata oluştu",
    };
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
