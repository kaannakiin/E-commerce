import { CustomFile } from "@/types/types";
import { existsSync } from "fs";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";

const ASSET_DIR = path.join(process.cwd(), "assets");
const DEFAULT_QUALITY = 75; // CustomImage'deki varsayılan değerle eşleştirdik
const MAX_WIDTH = 2000;
const BLUR_THUMBNAIL = 1; // Thumbnail için blur değeri

// Thumbnail boyutları
const THUMBNAIL_WIDTH = 10; // CustomImage'de belirtilen sizes="10px" ile uyumlu

interface ProcessImageOptions {
  width?: number;
  quality?: number;
  thumbnail?: boolean;
}

async function processImage(
  filePath: string,
  options: ProcessImageOptions,
): Promise<Buffer> {
  const { width, quality = DEFAULT_QUALITY, thumbnail = false } = options;

  try {
    let imageProcessor = sharp(await fs.readFile(filePath));

    if (thumbnail) {
      // Thumbnail işlemi - CustomImage'deki düşük kaliteli placeholder için
      return await imageProcessor
        .resize(THUMBNAIL_WIDTH, undefined, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .blur(BLUR_THUMBNAIL)
        .jpeg({ quality: 60 }) // Thumbnail için düşük kalite
        .toBuffer();
    } else {
      // Ana görsel işlemi
      if (width) {
        imageProcessor = imageProcessor.resize({
          width: Math.min(width, MAX_WIDTH),
          withoutEnlargement: true,
          fit: "inside",
        });
      }

      return await imageProcessor
        .jpeg({
          quality: Math.min(Math.max(quality, 1), 100),
          mozjpeg: true,
        })
        .toBuffer();
    }
  } catch (error) {
    console.error("Image processing error:", error);
    throw new Error("Failed to process image");
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    const width = parseInt(req.nextUrl.searchParams.get("width") || "0", 10);
    const quality = parseInt(
      req.nextUrl.searchParams.get("quality") || DEFAULT_QUALITY.toString(),
      10,
    );
    const thumbnail = req.nextUrl.searchParams.get("thumbnail") === "true";

    // Validasyonlar
    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    if (url.includes("..") || url.includes("/")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Dosya yolunu belirle
    const fileName = `${url}`; // Tüm dosyaları jpg olarak saklıyoruz
    const filePath = path.join(ASSET_DIR, fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Resmi işle
    const processedImage = await processImage(filePath, {
      width,
      quality,
      thumbnail,
    });

    // Response headerları
    const headers = {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400",
      "Last-Modified": new Date().toUTCString(),
    };

    return new NextResponse(processedImage, { headers });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
