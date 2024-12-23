import { TamiClient } from "@/lib/Tami/TamiClient";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const paymentRequest = { binNumber: "45438877" };
    const req = await TamiClient.binCheck(paymentRequest.binNumber);
    console.log(req);
  } catch (error) {}
}
