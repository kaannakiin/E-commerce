import { CustomFile } from "@/types/types";
import fs from "fs/promises";
import path from "path";
import sharp, { FitEnum } from "sharp";
import { createId } from "@paralleldrive/cuid2";

interface ProcessedImage {
  url: string;
  thumbnail: string;
  ogImage?: string;
  width: number;
  height: number;
  size: number;
  format: string;
  variants?: string[]; // Favicon varyantları için eklendi
}

interface ImageProcessingOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  thumbnailWidth?: number;
  format?: "jpeg" | "webp" | "avif";
  maintainAspectRatio?: boolean;
  ogImageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "jpeg" | "png";
    background?: string;
  };
  isLogo?: boolean;
  isFavicon?: boolean;
}

interface FaviconSizes {
  size: number;
  suffix: string;
  format: "png" | "ico";
}

const faviconSizes: FaviconSizes[] = [
  { size: 16, suffix: "16x16", format: "png" },
  { size: 32, suffix: "32x32", format: "png" },
  { size: 48, suffix: "48x48", format: "png" },
  { size: 180, suffix: "180x180", format: "png" }, // Apple Touch Icon
  { size: 192, suffix: "192x192", format: "png" }, // Android Chrome
  { size: 512, suffix: "512x512", format: "png" }, // PWA
];

async function processFavicon(
  buffer: Buffer,
  baseFileName: string,
  assetsDir: string,
): Promise<string[]> {
  const createdFiles: string[] = [];

  try {
    // Her boyut için favicon oluştur
    for (const { size, suffix, format } of faviconSizes) {
      const fileName = `${baseFileName}-${suffix}.${format}`;
      const outputPath = path.join(assetsDir, fileName);

      await sharp(buffer)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png({
          quality: 100,
          compressionLevel: 9,
        })
        .toFile(outputPath);

      createdFiles.push(outputPath);
    }

    // ICO dosyası oluştur (16x16 ve 32x32 boyutları içerir)
    const icoFileName = `${baseFileName}.ico`;
    const icoPath = path.join(assetsDir, icoFileName);

    // ICO için 16x16 ve 32x32 boyutlarını hazırla
    const smallBuffer = await sharp(buffer)
      .resize(16, 16, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toBuffer();

    const mediumBuffer = await sharp(buffer)
      .resize(32, 32, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toBuffer();

    await sharp(mediumBuffer).png().toFile(icoPath);

    createdFiles.push(icoPath);

    return createdFiles;
  } catch (error) {
    await cleanupFiles(createdFiles);
    throw error;
  }
}
const defaultOptions: ImageProcessingOptions = {
  quality: 80,
  maxWidth: 1920,
  maxHeight: 1920,
  thumbnailWidth: 300,
  format: "webp",
  maintainAspectRatio: true,
  isLogo: false,
  isFavicon: false,
  ogImageOptions: {
    width: 1200,
    height: 630,
    quality: 85,
    format: "jpeg",
    background: "#FFFFFF",
  },
};

export function generateFileName(prefix: string = ""): string {
  const now = new Date();
  const date = now
    .toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\./g, "-");
  const id = createId();
  return `${prefix}${date}-${id}`;
}

export async function cleanupFiles(files: string[]) {
  for (const file of files) {
    try {
      if (file) {
        await fs.access(file);
        await fs.unlink(file);
      }
    } catch (error) {
      console.warn(`Cleanup warning for ${file}:`, error);
    }
  }
}

async function createOGImage(
  buffer: Buffer,
  outputPath: string,
  options: ImageProcessingOptions["ogImageOptions"],
): Promise<void> {
  const { width, height, quality, format, background } = {
    ...defaultOptions.ogImageOptions,
    ...options,
  };

  let sharpInstance = sharp(buffer)
    .resize(width, height, {
      fit: "contain",
      background: background,
    })
    .rotate();

  if (format === "jpeg") {
    sharpInstance = sharpInstance.jpeg({
      quality: quality,
      mozjpeg: true,
      force: true,
    });
  } else {
    sharpInstance = sharpInstance.png({
      quality: quality,
      force: true,
    });
  }

  await sharpInstance.toFile(outputPath);
}

export const processImages = async (
  files: File[],
  options: ImageProcessingOptions = {},
): Promise<ProcessedImage[]> => {
  const ASSETS_DIR = path.join(process.cwd(), "assets");
  try {
    await fs.access(ASSETS_DIR);
  } catch (error) {
    await fs.mkdir(ASSETS_DIR, { recursive: true });
  }
  const createdFiles: string[] = [];
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    const processedImages: ProcessedImage[] = [];

    for (const file of files) {
      let outputPath = "";
      let thumbnailPath = "";
      let ogImagePath = "";
      let faviconPaths: string[] = []; // Burada tanımlandı
      try {
        const buffer = Buffer.from(await (file as CustomFile).arrayBuffer());

        const isLogo =
          file.name.toLowerCase().startsWith("logo") || mergedOptions.isLogo;
        const isFavicon = mergedOptions.isFavicon;

        const baseFileName = generateFileName(
          isLogo ? "logo-" : isFavicon ? "favicon-" : "",
        );
        if (isFavicon) {
          faviconPaths = await processFavicon(buffer, baseFileName, ASSETS_DIR);
          createdFiles.push(...faviconPaths);
          const mainFaviconName = `${baseFileName}.ico`;

          // Favicon sonuçlarını ekle
          const result: ProcessedImage = {
            url: mainFaviconName,
            thumbnail: `${baseFileName}-32x32.png`,
            width: 32,
            height: 32,
            size: (await fs.stat(path.join(ASSETS_DIR, mainFaviconName))).size,
            format: "ico",
            variants: faviconPaths.map((p) => path.basename(p)),
          };

          processedImages.push(result);
          continue; // Normal resim işleme sürecini atla
        }
        const fileName = `${baseFileName}.${mergedOptions.format}`;
        const thumbnailName = `${baseFileName}-thumbnail.${mergedOptions.format}`;

        outputPath = path.join(ASSETS_DIR, fileName);
        thumbnailPath = path.join(ASSETS_DIR, thumbnailName);

        const resizeOptions = isLogo
          ? {
              width: mergedOptions.maxWidth,
              height: mergedOptions.maxHeight,
              fit: "inside" as keyof FitEnum,
              withoutEnlargement: true,
            }
          : mergedOptions.maintainAspectRatio
            ? {
                width: mergedOptions.maxWidth,
                height: mergedOptions.maxHeight,
                fit: "inside" as keyof FitEnum,
                withoutEnlargement: true,
              }
            : {
                width: mergedOptions.maxWidth,
                height: mergedOptions.maxHeight,
                fit: "fill" as keyof FitEnum,
              };

        let processedImage = sharp(buffer).resize(resizeOptions).rotate();

        switch (mergedOptions.format) {
          case "webp":
            processedImage = processedImage.webp({
              quality: mergedOptions.quality,
              effort: 6,
            });
            break;
          case "avif":
            processedImage = processedImage.avif({
              quality: mergedOptions.quality,
              effort: 6,
            });
            break;
          default:
            processedImage = processedImage.jpeg({
              quality: mergedOptions.quality,
              mozjpeg: true,
            });
        }

        await processedImage.toFile(outputPath);
        createdFiles.push(outputPath);

        await sharp(buffer)
          .resize(mergedOptions.thumbnailWidth, undefined, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .blur(1)
          [mergedOptions.format]({ quality: 10 })
          .toFile(thumbnailPath);

        createdFiles.push(thumbnailPath);

        let ogImageName: string | undefined;
        if (!isLogo) {
          ogImageName = `${baseFileName}-og.${mergedOptions.ogImageOptions?.format || "jpeg"}`;
          ogImagePath = path.join(ASSETS_DIR, ogImageName);
          await createOGImage(
            buffer,
            ogImagePath,
            mergedOptions.ogImageOptions,
          );
          createdFiles.push(ogImagePath);
        }

        const finalMetadata = await sharp(outputPath).metadata();
        const stats = await fs.stat(outputPath);

        const result: ProcessedImage = {
          url: fileName,
          thumbnail: thumbnailName,
          width: finalMetadata.width || 0,
          height: finalMetadata.height || 0,
          size: stats.size,
          format: mergedOptions.format,
        };

        if (ogImageName) {
          result.ogImage = ogImageName;
        }

        processedImages.push(result);
      } catch (error) {
        console.error(`Error processing image ${file.name}:`, error);
        await cleanupFiles(
          [outputPath, thumbnailPath, ogImagePath].filter(Boolean),
        );
      }
    }

    if (processedImages.length === 0) {
      await cleanupFiles(createdFiles);
      throw new Error("No images were processed successfully");
    }

    return processedImages;
  } catch (error) {
    await cleanupFiles(createdFiles);
    console.error("Fatal error in processImages:", error);
    throw error;
  }
};
