import { TamiClient } from "@/lib/Tami/TamiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const paymentRequest = { binNumber: "45438877" };
    console.log("Sending request with binNumber:", paymentRequest.binNumber);

    const response = await TamiClient.binCheck(paymentRequest.binNumber);
    console.log("Response received:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in API route:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
      },
      { status: 400 },
    );
  }
}
