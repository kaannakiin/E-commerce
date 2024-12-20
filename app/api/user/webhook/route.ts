import { findByPaymentIdAndUpdate } from "@/lib/İyzico/helper/helper";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (data.status === "SUCCESS") {
      const paymentId = data.paymentId.toString();
      if (!paymentId) {
        return NextResponse.json({
          status: "error",
          message: "Payment Id boş olamaz",
        });
      }
      const updateOrder = await findByPaymentIdAndUpdate(paymentId.toString());
      if (!updateOrder.success) {
        return NextResponse.json({
          status: "error",
          message: updateOrder.message,
        });
      }

      return NextResponse.json({
        status: "success",
        message: "Sipariş başarıyla güncellendi",
      });
    }
    return NextResponse.json({
      status: "success",
      message: "Webhook received",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
