import { NextResponse } from "next/server";
import redisClient from "@/lib/redisConnect";

export async function POST(request: Request) {
  if (!redisClient) {
    console.error("Redis client is not initialized");
    return NextResponse.json(
      { error: "Redis connection is not available" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    // Gelen veriyi logla

    if (!key || !value) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 },
      );
    }

    // Redis bağlantısını test et
    const pingResult = await redisClient.ping();

    // Veriyi kaydetmeyi dene ve sonucu logla
    const setResult = await redisClient.set(key, JSON.stringify(value));

    // Kaydedilen veriyi hemen oku ve kontrol et
    const savedValue = await redisClient.get(key);

    if (setResult !== "OK") {
      throw new Error(`Redis set failed: ${setResult}`);
    }

    return NextResponse.json(
      {
        message: "Data saved successfully",
        debug: {
          setResult,
          savedValue,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Detailed Redis error:", error);
    return NextResponse.json(
      {
        error: "Failed to save data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
