import { Calculate } from "@/lib/calcBilling";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
  const bill = await Calculate(data.variantIdQty, data.params);
  return NextResponse.json({ status: 200 });
}
