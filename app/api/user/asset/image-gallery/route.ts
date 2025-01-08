import { rateLimiter } from "@/lib/rateLimitRedis";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { existsSync } from "fs";

export async function GET(req: NextRequest) {
  try {
    // const ip =
    //   req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");

    // // Rate limiting
    // const rateLimit = await rateLimiter(ip, {
    //   limit: 50,
    //   windowInMinutes: 30,
    // });
    // if (!rateLimit.success) {
    //   return NextResponse.json(
    //     {
    //       error: "Too many requests",
    //       reset: rateLimit.reset,
    //     },
    //     {
    //       status: 429,
    //       headers: {
    //         "X-RateLimit-Limit": rateLimit.limit.toString(),
    //         "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    //         "X-RateLimit-Reset": (rateLimit.reset || 0).toString(),
    //       },
    //     },
    //   );
    // }

    const ASSET_DIR = path.join(process.cwd(), "rich-text-assets");
    const url = req.nextUrl.searchParams.get("url");
    const quality = parseInt(
      req.nextUrl.searchParams.get("quality") || "80",
      10,
    );
    const width = parseInt(req.nextUrl.searchParams.get("width") || "0", 10);
    const height = parseInt(req.nextUrl.searchParams.get("height") || "0", 10);

    if (!url) {
      return NextResponse.json(
        { error: "Resim URL'si gereklidir." },
        { status: 400 },
      );
    }

    // Path traversal saldırılarına karşı koruma
    const normalizedPath = path.normalize(url).replace(/^(\.\.(\/|\\|$))+/, "");
    const filePath = path.join(ASSET_DIR, normalizedPath);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Resim bulunamadı" }, { status: 404 });
    }

    const imageBuffer = await fs.readFile(filePath);
    let imageProcessor = sharp(imageBuffer);
    if (width || height) {
      imageProcessor = imageProcessor.resize(width || null, height || null, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const processedImage = await imageProcessor
      .jpeg({
        quality: Math.min(Math.max(quality, 1), 100), // Kaliteyi 1-100 arasında sınırla
      })
      .toBuffer();

    return new NextResponse(processedImage, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control":
          "public, max-age=31536000, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
        Vary: "Accept-Encoding",
      },
    });
  } catch (error) {
    console.error("Resim işleme hatası:", error);
    return NextResponse.json(
      { error: "Resim işlenirken bir hata oluştu" },
      { status: 500 },
    );
  }
}
