import { NextResponse } from "next/server";
import redisClient from "@/lib/redisConnect";

export async function GET(request: Request) {
  if (!redisClient) {
    return NextResponse.json(
      { error: "Redis connection is not available" },
      { status: 500 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Key parameter is required" },
        { status: 400 },
      );
    }

    const value = await redisClient.get(key);
    if (!value) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        value: JSON.parse(value),
        debug: { rawValue: value },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Redis get error:", error);
    return NextResponse.json(
      {
        error: "Failed to get data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
