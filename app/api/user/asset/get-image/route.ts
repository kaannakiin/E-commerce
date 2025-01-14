import { existsSync } from "fs";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";

// Constants aligned with NewRecordAsset
const ASSET_DIR = path.join(process.cwd(), "assets");
const RICH_TEXT_ASSET_DIR = path.join(process.cwd(), "rich-tech-assets");
const DEFAULT_QUALITY = 80; // Aligned with NewRecordAsset quality
const MAX_WIDTH = 1920; // Aligned with NewRecordAsset resize
const THUMBNAIL_QUALITY = 20; // Aligned with NewRecordAsset thumbnail quality
const OG_QUALITY = 85; // Aligned with NewRecordAsset og quality

interface ProcessImageOptions {
  width?: number;
  quality?: number;
  thumbnail?: boolean;
  og?: boolean;
  favicon?: boolean;
  richText?: boolean;
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
    const imageBuffer = await fs.readFile(filePath);
    let imageProcessor = sharp(imageBuffer);

    if (favicon) {
      return await imageProcessor
        .png({ quality: 80, compressionLevel: 7 })
        .resize(32, 32, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toBuffer();
    }

    if (thumbnail) {
      return await imageProcessor
        .webp({
          quality: THUMBNAIL_QUALITY,
          effort: 6,
          lossless: false,
          nearLossless: false,
          smartSubsample: true,
        })
        .blur(10)
        .toBuffer();
    }

    if (og) {
      return await imageProcessor
        .webp({
          quality: OG_QUALITY,
          effort: 4,
          lossless: false,
          nearLossless: true,
          smartSubsample: true,
        })
        .resize(1200, 630, {
          withoutEnlargement: true,
          position: "centre",
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .withMetadata({ orientation: 1 })
        .toColorspace("srgb")
        .toBuffer();
    }

    // Standard image processing
    if (width) {
      imageProcessor = imageProcessor.resize(
        Math.min(width, MAX_WIDTH),
        undefined,
        {
          withoutEnlargement: true,
          position: "centre",
          fit: "cover",
        },
      );
    }

    return await imageProcessor
      .webp({
        quality: Math.min(Math.max(quality, 1), 100),
        effort: 6,
        lossless: false,
        nearLossless: false,
        smartSubsample: true,
      })
      .withMetadata({ orientation: 1 })
      .toColorspace("srgb")
      .toBuffer();
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
    const favicon = req.nextUrl.searchParams.get("favicon") === "true";
    const richText = req.nextUrl.searchParams.get("richText") === "true";

    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    if (url.includes("..") || url.includes("/")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Determine correct asset directory
    const baseDir = richText ? RICH_TEXT_ASSET_DIR : ASSET_DIR;

    // Determine correct file name based on type
    const fileName = url;
    const actualFileName = og
      ? fileName.replace(/\.webp$/, "-og.webp")
      : thumbnail
        ? fileName.replace(/\.webp$/, "-thumbnail.webp")
        : fileName;

    const filePath = path.join(baseDir, actualFileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const processedImage = await processImage(filePath, {
      width,
      quality,
      thumbnail,
      og,
      favicon,
      richText,
    });

    const headers = {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400",
      "Cross-Origin-Resource-Policy": "same-site",
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
