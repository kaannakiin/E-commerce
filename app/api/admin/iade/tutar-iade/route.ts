import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
  } catch (error) {
    return error;
  }
  return NextResponse.json({
    status: "success",
    message: "İade tutarı başarıyla oluşturuldu.",
  });
}
