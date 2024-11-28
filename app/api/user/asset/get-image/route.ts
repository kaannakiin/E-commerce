import { rateLimiter } from "@/lib/rateLimitRedis";
import { existsSync } from "fs";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";

const ASSET_DIR = path.join(process.cwd(), "assets");
const DEFAULT_QUALITY = 80;
const MAX_WIDTH = 2000;

export async function GET(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    const canProceed = await rateLimiter(ip);
    if (!canProceed.success) {
      return NextResponse.json(
        { message: "Rate limit exceeded" },
        { status: 429 },
      );
    }
    const url = req.nextUrl.searchParams.get("url");
    const width = parseInt(req.nextUrl.searchParams.get("width") || "0", 10);
    const quality = parseInt(
      req.nextUrl.searchParams.get("quality") || "80",
      10,
    );
    const thumbnail = req.nextUrl.searchParams.get("thumbnail") === "true";

    if (!url) {
      return NextResponse.json(
        {
          error: "Image URL is required",
        },
        { status: 400 },
      );
    }

    // Güvenlik kontrolü
    if (url.includes("..") || url.includes("/")) {
      return NextResponse.json(
        {
          error: "Invalid URL",
        },
        { status: 400 },
      );
    }

    const fileName = thumbnail ? `${url}-thumbnail.jpg` : `${url}.jpg`;
    const filePath = path.join(ASSET_DIR, fileName);
    if (!existsSync(filePath)) {
      return NextResponse.json(
        {
          error: "Image not found",
        },
        { status: 404 },
      );
    }

    try {
      const image = sharp(await fs.readFile(filePath));

      const processedImage = await image
        .jpeg({ quality: Math.min(Math.max(quality, 1), 100) })
        .resize(width ? Math.min(width, MAX_WIDTH) : undefined)
        .toBuffer();

      return new NextResponse(processedImage, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000", // 1 yıl cache
        },
      });
    } catch (error) {
      console.error("Image processing error:", error);
      return NextResponse.json(
        {
          error: "Image processing failed",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
