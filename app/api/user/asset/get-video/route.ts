import { existsSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { rateLimiter } from "@/lib/rateLimitRedis";

const ASSET_DIR = path.join(process.cwd(), "assets");

export async function GET(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for") ||
      "::1";
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
    const url = req.nextUrl.searchParams.get("url");
    const quality = req.nextUrl.searchParams.get("quality") || "high";

    if (!url || !isValidVideoUrl(url)) {
      return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
    }

    const fileName = url;
    const filePath = path.join(ASSET_DIR, fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const stat = await fs.stat(filePath);
    const range = req.headers.get("range");

    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    if (!(await isAllowedToStream(clientIp))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    if (range) {
      return handleRangeRequest(filePath, range, stat.size);
    }

    return streamVideo(filePath, stat.size, quality);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function isValidVideoUrl(url: string): boolean {
  // URL'de tehlikeli karakterler olup olmadığını kontrol et
  if (url.includes("..") || url.includes("/")) {
    return false;
  }

  // Yeni pattern: dosya adı-tarih-randomstring.mp4 formatını kabul et
  const validUrlPattern =
    /^[a-zA-Z0-9-_]+(-\d{1,2}-\d{1,2}-\d{4}-[a-z0-9]+)\.mp4$/;

  return validUrlPattern.test(url);
}

// Video streaming helper fonksiyonu
async function streamVideo(
  filePath: string,
  fileSize: number,
  quality: string,
) {
  const videoBuffer = await fs.readFile(filePath);

  const headers = {
    "Content-Length": fileSize.toString(),
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };

  return new NextResponse(videoBuffer, { headers });
}
// Rate limiting için helper fonksiyon
const requestCounts = new Map<string, { count: number; timestamp: number }>();

async function isAllowedToStream(clientIp: string): Promise<boolean> {
  const now = Date.now();
  const limit = 100; // Her 15 dakikada maksimum istek sayısı
  const window = 15 * 60 * 1000; // 15 dakika

  const current = requestCounts.get(clientIp) || { count: 0, timestamp: now };

  // Zaman penceresi dışındaysa sayacı sıfırla
  if (now - current.timestamp > window) {
    current.count = 0;
    current.timestamp = now;
  }

  // İstek sayısı limiti aşıyorsa reddet
  if (current.count >= limit) {
    return false;
  }

  // İstek sayısını güncelle
  current.count++;
  requestCounts.set(clientIp, current);

  return true;
}

// Range request handler
async function handleRangeRequest(
  filePath: string,
  range: string,
  fileSize: number,
) {
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunkSize = end - start + 1;

  const videoBuffer = await fs.readFile(filePath);
  const videoChunk = videoBuffer.slice(start, end + 1);

  return new NextResponse(videoChunk, {
    status: 206,
    headers: {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize.toString(),
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}
