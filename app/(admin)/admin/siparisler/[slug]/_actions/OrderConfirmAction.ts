"use server";

import { SendOrderConfirmedEmail } from "@/actions/sendMailAction/SendMail";
import { isAuthorized } from "@/lib/isAdminorSuperAdmin";
import { prisma } from "@/lib/prisma";
export async function OrderConfirmAction(
  orderNumber: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await isAuthorized();
    if (!session) {
      return { success: false, message: "Yetkisiz Erişim" };
    }

    const order = await prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        OrderItems: {
          include: {
            variant: { include: { product: true, Image: { take: 1 } } },
          },
        },
        user: true,
        address: true,
      },
    });

    if (!order) {
      return { success: false, message: "Sipariş bulunamadı" };
    }

    if (order.status === "PENDING" && order.paymentStatus === "SUCCESS") {
      // fatura.enableTestMode();
      // const token = await fatura.getToken("33333307", "1");
      // console.log(token);
      // const invoiceExample = {
      //   uuid: uuidv4(),
      //   date: "18/01/2025", // Today's date
      //   time: "09:07:48",
      //   taxIDOrTRID: "11111111111",
      //   taxOffice: "Beylikduzu",
      //   title: "FATIH AKIN",
      //   name: "",
      //   surname: "",
      //   fullAddress: "X Sok. Y Cad. No: 3 Z Istanbul",
      //   country: "Türkiye",
      //   currency: "TRY",
      //   currencyRate: "1",
      //   invoiceType: "5000/30000",
      //   email: "test@example.com",
      //   items: [
      //     {
      //       name: "Stickker",
      //       quantity: 1,
      //       unitPrice: 100,
      //       price: 100,
      //       VATRate: 18,
      //       VATAmount: 18,
      //     },
      //   ],
      //   totalVAT: 18,
      //   grandTotal: 100.0,
      //   grandTotalInclVAT: 118.0,
      //   paymentTotal: 118.0,
      // };
      // const invoice = await fatura.createDraftInvoice(token, invoiceExample);
      // console.log(invoice);

      // const findInvoiceReturn = await fatura.findInvoice(token, {
      //   date: invoice.date,
      //   uuid: invoice.uuid,
      // });
      // const signinvoice = await fatura.signDraftInvoice(
      //   token,
      //   findInvoiceReturn,
      // );
      // console.log(findInvoiceReturn);
      // console.log(signinvoice);
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING",
        },
      });

      const sendEmail = await SendOrderConfirmedEmail({
        orderNumber: order.orderNumber,
        toEmail: order?.user?.email || order?.address?.email,
        products: order.OrderItems.map((item) => ({
          name: item.variant.product.name,
          price: item.price,
          productImageUrl: item.variant.Image[0].url,
          quantity: item.quantity,
          type: item.variant.type,
          value: item.variant.value,
          unit: item.variant.unit,
        })),
      });

      if (!sendEmail.success) {
        console.error("E-posta gönderim hatası:", sendEmail.error);
      }

      return {
        success: true,
        message: "Sipariş onaylandı ve fatura oluşturuldu",
      };
    }

    return { success: false, message: "Sipariş durumu uygun değil" };
  } catch (error) {
    console.error("Genel hata:", error);
    return { success: false, message: "Beklenmeyen bir hata oluştu." };
  }
}
