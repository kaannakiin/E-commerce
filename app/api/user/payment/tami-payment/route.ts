import { TamiClient } from "@/lib/Tami/TamiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Log the raw request first
    const rawBody = await req.text();
    console.log("Raw request body:", rawBody);

    // Try to parse the body
    let body;
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON format",
          details: parseError.message,
        },
        { status: 400 },
      );
    }

    // Extract and validate binNumber
    const binNumber = body.binNumber;
    if (!binNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "binNumber is required in request body",
        },
        { status: 400 },
      );
    }

    console.log("Processing BIN check for:", binNumber);
    const response = await TamiClient.binCheck(binNumber);

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        details: error.stack,
      },
      { status: error.status || 500 },
    );
  }
}
