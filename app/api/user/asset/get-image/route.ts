import { rateLimiter } from "@/lib/rateLimitRedis";
import { existsSync } from "fs";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";

const ASSET_DIR = path.join(process.cwd(), "assets");
const RICH_TEXT_ASSET_DIR = path.join(process.cwd(), "rich-tech-assets");
const DEFAULT_QUALITY = 80;
const MAX_WIDTH = 1920;
const THUMBNAIL_QUALITY = 20;
const OG_QUALITY = 85;
const EMAIL_QUALITY = 85;

interface ProcessImageOptions {
  width?: number;
  quality?: number;
  thumbnail?: boolean;
  og?: boolean;
  favicon?: boolean;
  richText?: boolean;
  forEmail?: boolean;
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
    forEmail = false,
  } = options;

  try {
    const imageBuffer = await fs.readFile(filePath);
    let imageProcessor = sharp(imageBuffer);

    // Email için özel işleme
    if (forEmail) {
      return await imageProcessor
        .jpeg({
          quality: EMAIL_QUALITY,
          progressive: true,
        })
        .withMetadata({ orientation: 1 })
        .toColorspace("srgb")
        .toBuffer();
    }

    // Mevcut işlemler aynen devam ediyor
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
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for") ||
      "::1";
    const rateLimit = await rateLimiter(ip, {
      limit: 50,
      windowInMinutes: 30,
    });
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          reset: rateLimit.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": (rateLimit.reset || 0).toString(),
          },
        },
      );
    }

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
    const forEmail = req.nextUrl.searchParams.get("forEmail") === "true";
    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    // URL güvenlik kontrolü
    if (url.includes("..")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const baseDir = richText ? RICH_TEXT_ASSET_DIR : ASSET_DIR;

    // Dosya yolu oluşturma
    const filePath = path.join(baseDir, url);

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
      forEmail,
    });

    const contentType = forEmail ? "image/jpeg" : "image/webp";

    const headers = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
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
