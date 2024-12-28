import { SendOrder } from "@/actions/order/SendOrder";
import { EmailTemplateTypeForUI } from "@/app/(admin)/admin/ayarlar/e-mail/types/type";
import { findByPaymentIdAndUpdate } from "@/lib/İyzico/helper/helper";
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
      await SendOrder({
        type: EmailTemplateTypeForUI.ORDER_CREATED,
        email: updateOrder.email,
        products: updateOrder.product,
      });
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
