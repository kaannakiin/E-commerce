import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import { Card, Container, Paper } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import OrderDetailsPage from "../_components/OrderDetail";
import BankTransferConfirmButton from "../_components/BankTransferConfirmButton";
import OrderConfirmCheck from "./_components/OrderConfirmCheck";

export type Order = Prisma.OrderGetPayload<{
  select: {
    id: true;
    createdAt: true;
    orderNumber: true;
    priceIyzico: true;
    paymentDate: true;
    paymentId: true;
    total: true;
    maskedCardNumber: true;
    status: true;
    isCancelled: true;
    cancelPaymentId: true;
    cancelProcessDate: true;
    cancelReason: true;
    paymentType: true;
    paymentStatus: true;
    address: {
      select: {
        name: true;
        surname: true;
        email: true;
        phone: true;
        city: true;
        district: true;
        addressDetail: true;
      };
    };
    discountCode: true;
    user: true;
    OrderItems: {
      select: {
        id: true;
        refundStatus: true;
        refundAmount: true;
        paymentTransactionId: true;
        refundReason: true;
        isRefunded: true;
        refundRequestDate: true;
        quantity: true;
        price: true;
        iyzicoPrice: true;
        variant: {
          select: {
            value: true;
            unit: true;
            type: true;
            Image: {
              take: 1;
              select: {
                url: true;
              };
            };
            product: {
              select: {
                name: true;
              };
            };
          };
        };
      };
    };
  };
}>;
export type OrderRefundType = Prisma.OrderItemsGetPayload<{
  select: {
    id: true;
    refundStatus: true;
    refundAmount: true;
    paymentTransactionId: true;
    refundReason: true;
    isRefunded: true;
    refundRequestDate: true;
    quantity: true;
    price: true;
    iyzicoPrice: true;

    variant: {
      select: {
        value: true;
        unit: true;
        type: true;
        Image: {
          take: 1;
          select: {
            url: true;
          };
        };
        product: {
          select: {
            name: true;
          };
        };
      };
    };
  };
}>;
export type BankTransferNotificationType =
  Prisma.BankTransferNotificationGetPayload<{
    select: {
      name: true;
      surname: true;
      orderNumber: true;
      transactionTime: true;
    };
  }>;
const feedPage = async (slug: string) => {
  const order = await prisma.order.findUnique({
    where: {
      orderNumber: slug,
    },
    select: {
      id: true,
      createdAt: true,
      orderNumber: true,
      priceIyzico: true,
      paymentDate: true,
      paymentId: true,
      total: true,
      paymentType: true,
      maskedCardNumber: true,
      status: true,
      isCancelled: true,
      cancelPaymentId: true,
      cancelProcessDate: true,
      cancelReason: true,
      paymentStatus: true,
      BankTransferNotification: {
        select: {
          name: true,
          surname: true,
          orderNumber: true,
          transactionTime: true,
        },
      },
      address: {
        select: {
          name: true,
          surname: true,
          email: true,
          phone: true,
          city: true,
          district: true,
          addressDetail: true,
        },
      },
      discountCode: true,
      user: true,
      OrderItems: {
        select: {
          id: true,
          refundStatus: true,
          refundAmount: true,
          paymentTransactionId: true,
          refundReason: true,
          isRefunded: true,
          refundRequestDate: true,
          quantity: true,
          price: true,
          iyzicoPrice: true,
          variant: {
            select: {
              value: true,
              unit: true,
              type: true,
              Image: {
                take: 1,
                select: {
                  url: true,
                },
              },
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return null;
  }
  return order;
};

const OrderDetailPage = async (props: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const slug = (await props.params).slug;
  const order = await feedPage(slug);

  if (!order) {
    return notFound();
  }

  return (
    <div className="w-full space-y-1">
      <Container
        size="xl"
        pt={"xs"}
        className="flex flex-row justify-end gap-3"
      >
        {order.paymentType === "BANK_TRANSFER" &&
          order.status === "PENDING" &&
          order.paymentStatus === "PENDING" && (
            <BankTransferConfirmButton
              bankTransferNotification={order?.BankTransferNotification[0]}
              orderTotal={order.total}
            />
          )}
        {order.status === "PENDING" && order.paymentStatus === "SUCCESS" && (
          <OrderConfirmCheck orderNumber={order.orderNumber} />
        )}
      </Container>
      <OrderDetailsPage order={order} />
    </div>
  );
};

export default OrderDetailPage;
