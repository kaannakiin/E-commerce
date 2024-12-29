import { CustomFile } from "@/types/types";
import { existsSync } from "fs";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";
const FAVICON_SIZES = [16, 32, 48] as const;
const ASSET_DIR = path.join(process.cwd(), "assets");
const DEFAULT_QUALITY = 75; // CustomImage'deki varsayılan değerle eşleştirdik
const MAX_WIDTH = 2000;
const BLUR_THUMBNAIL = 1; // Thumbnail için blur değeri
const THUMBNAIL_WIDTH = 10; // CustomImage'de belirtilen sizes="10px" ile uyumlu
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

interface ProcessImageOptions {
  width?: number;
  quality?: number;
  thumbnail?: boolean;
  og?: boolean;
  favicon?: boolean;
}

async function processImage(
  filePath: string,
  options: ProcessImageOptions,
): Promise<Buffer> {
  const {
    width,
    quality = DEFAULT_QUALITY,
    thumbnail = false,
    og = false,
    favicon = false,
  } = options;
  try {
    let imageProcessor = sharp(await fs.readFile(filePath));
    if (favicon) {
      const image = sharp(await fs.readFile(filePath));

      // Her boyut için ayrı bir Buffer oluştur
      const faviconBuffers = await Promise.all(
        FAVICON_SIZES.map(async (size) => {
          return await image
            .resize(size, size, {
              fit: "contain",
              background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .png()
            .toBuffer();
        }),
      );

      return await sharp(faviconBuffers[1]).png().toBuffer();
    }
    if (thumbnail) {
      return await imageProcessor
        .resize(THUMBNAIL_WIDTH, undefined, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .blur(BLUR_THUMBNAIL)
        .jpeg({ quality: 60 }) // Thumbnail için düşük kalite
        .toBuffer();
    } else if (og) {
      // OG Image işlemi
      return await imageProcessor
        .resize(OG_WIDTH, OG_HEIGHT, {
          fit: "cover",
          position: "center",
        })
        .jpeg({
          quality: 90, // OG images için yüksek kalite
          mozjpeg: true,
        })
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
    const og = req.nextUrl.searchParams.get("og") === "true";
    const favicon = req.nextUrl.searchParams.get("favicon") === "true"; // Yeni eklenen
    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }
    if (url.includes("..") || url.includes("/")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    const fileName = url;
    const actualFileName = og
      ? fileName.replace(/\.(jpg|jpeg|png|webp)$/, "-og.jpeg")
      : favicon
        ? fileName.replace(/\.(jpg|jpeg|png|webp)$/, ".ico")
        : fileName;

    const filePath = path.join(ASSET_DIR, actualFileName);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const processedImage = await processImage(filePath, {
      width,
      quality,
      thumbnail,
      og,
      favicon,
    });

    const headers = {
      "Content-Type": favicon ? "image/png" : "image/jpeg",
      "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
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
