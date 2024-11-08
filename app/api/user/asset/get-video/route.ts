import { existsSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const ASSET_DIR = path.join(process.cwd(), "assets");

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");

    // URL kontrolü
    if (!url) {
      return NextResponse.json(
        {
          error: "Video URL is required",
        },
        { status: 400 }
      );
    }
    if (url.includes("..") || url.includes("/")) {
      return NextResponse.json(
        {
          error: "Invalid URL",
        },
        { status: 400 }
      );
    }

    const fileName = `${url}.mp4`;
    const filePath = path.join(ASSET_DIR, fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        {
          error: "Video not found",
        },
        { status: 404 }
      );
    }

    try {
      const stat = await fs.stat(filePath);
      const fileSize = stat.size;
      const videoBuffer = await fs.readFile(filePath);

      const range = req.headers.get("range");
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const videoChunk = videoBuffer.slice(start, end + 1);

        // Partial content response
        return new NextResponse(videoChunk, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize.toString(),
            "Content-Type": "video/mp4",
            "Cache-Control": "public, max-age=31536000", // 1 yıl cache
          },
        });
      }

      // Range header yoksa tüm videoyu gönder
      return new NextResponse(videoBuffer, {
        headers: {
          "Content-Length": fileSize.toString(),
          "Content-Type": "video/mp4",
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000", // 1 yıl cache
        },
      });
    } catch (error) {
      console.error("Video processing error:", error);
      return NextResponse.json(
        {
          error: "Video processing failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
