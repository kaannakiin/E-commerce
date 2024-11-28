import { auth } from "@/auth";
import { iyzico } from "@/lib/iyzicoClient";
import {
  generateNon3DSignature,
  generateOrderNumber,
  groupTransactionsByItemId,
} from "@/lib/IyzicoHelper";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  try {
    const formData = await req.formData();
    const status = formData.get("status") as string;
    const mdStatus = formData.get("mdStatus") as string;
    const paymentId = formData.get("paymentId") as string;
    const conversationId = formData.get("conversationId") as string;
    const conversationData = formData.get("conversationData") as string;
    const signature = formData.get("signature");
    const signatureCheck =
      generateNon3DSignature({
        conversationData: conversationData,
        conversationId: conversationId,
        mdStatus: mdStatus,
        paymentId: paymentId,
        status: status,
        type: "Callback",
      }) === signature
        ? true
        : false;
    if (!signatureCheck) {
      await prisma.tempPayment.delete({
        where: {
          token,
        },
      });
      return NextResponse.json(
        {
          status: 400,
          message: "Beklenmeyen bir hata oluştu.",
        },
        { status: 400 },
      );
    }
    if (!token) {
      return new NextResponse(
        `
    <html>
      <body>
        <script>
          window.parent.postMessage({ 
            status: 'error',
            message: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.',
          }, '*');
        </script>
      </body>
    </html>
    `,
        {
          headers: {
            "Content-Type": "text/html",
          },
        },
      );
    }
    if (mdStatus === "0" || mdStatus === "-1") {
      await prisma.tempPayment.delete({
        where: {
          token,
        },
      });
      return new NextResponse(
        `
    <html>
      <body>
        <script>
          window.parent.postMessage({ 
            status: 'error',
            message: '3D Secure doğrulaması başarısız oldu. Lütfen tekrar deneyiniz.',
          }, '*');
        </script>
      </body>
    </html>
    `,
        {
          headers: {
            "Content-Type": "text/html",
          },
        },
      );
    }
    if (mdStatus !== "1") {
      await prisma.tempPayment.delete({
        where: {
          token,
        },
      });
      return new NextResponse(
        `
    <html>
      <body>
        <script>
          window.parent.postMessage({ 
            status: 'error',
            message: '3D Secure doğrulaması başarısız oldu. Lütfen tekrar deneyiniz.',
          }, '*');
        </script>
      </body>
    </html>
    `,
        {
          headers: {
            "Content-Type": "text/html",
          },
        },
      );
    }

    if (mdStatus === "1") {
      const orderNumber = await prisma.$transaction(async (tx) => {
        const temp = await tx.tempPayment.findUnique({
          where: {
            token: token,
          },
        });
        if (!temp) {
          return NextResponse.json(
            {
              status: 400,
              message: "Beklenmeyen bir hata oluştu.",
            },
            { status: 400 },
          );
        }

        const paymentRequest = await iyzico.v2Check3DResult({
          locale: "tr",
          conversationId: token,
          paymentId: temp.paymentId,
          paidPrice: temp.paidPrice,
          basketId: temp.basketId,
          currency: "TRY",
        });
        if (paymentRequest.status === "failure") {
          return NextResponse.json(
            {
              status: 400,
              message: "Ödeme işlemi başarısız oldu.",
            },
            { status: 400 },
          );
        }
        const items = groupTransactionsByItemId(
          paymentRequest.itemTransactions,
        );
        if (temp.discountCode) {
          await tx.discountCode.update({
            where: {
              code: temp.discountCode,
            },
            data: {
              uses: {
                increment: 1,
              },
            },
          });
        }
        const order = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            paymentId: paymentId,
            paidPrice: parseFloat(
              items
                .reduce((acc, item) => acc + item.paidPrice * item.quantity, 0)
                .toFixed(2),
            ),
            address: {
              connect: {
                id: temp.addressId,
              },
            },
            orderItems: {
              createMany: {
                data: items.map((item) => ({
                  variantId: item.itemId,
                  quantity: item.quantity,
                  price: item.price,
                  paidPrice: item.paidPrice,
                  totalPrice: item.paidPrice * item.quantity,
                  iyzicoPerPrice: item.merchantPayoutAmount,
                  iyzicoPerTotal: item.merchantPayoutAmount * item.quantity,
                })),
              },
            },
            user: temp.userId ? { connect: { id: temp.userId } } : undefined,
            discountCode: temp.discountCode
              ? {
                  connect: {
                    code: temp.discountCode,
                  },
                }
              : undefined,
            paidPriceIyzico: parseFloat(
              items
                .reduce(
                  (acc, item) =>
                    acc + item.merchantPayoutAmount * item.quantity,
                  0,
                )
                .toFixed(2),
            ),
            ip: temp.ip,
          },
        });
        await tx.tempPayment.delete({
          where: {
            token,
          },
        });
        return order.orderNumber;
      });
      return new NextResponse(
        `
      <html>
        <body>
          <script>
            window.parent.postMessage({ 
              status: 'success',
              redirectUrl: '/siparis?status=basarili&orderNumber=${orderNumber}'
            }, '*');
          </script>
        </body>
      </html>
      `,
        {
          headers: {
            "Content-Type": "text/html",
          },
        },
      );
    }
  } catch (error) {
    await prisma.tempPayment.delete({
      where: {
        token,
      },
    });
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.parent.postMessage({
              status: 'error',
              message: 'Ödeme işlemi başarısız oldu',
            }, '*');
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  }
}
