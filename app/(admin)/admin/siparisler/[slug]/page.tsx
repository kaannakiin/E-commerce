import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import { Card, Paper } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import OrderDetailsPage from "../_components/OrderDetail";

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
      maskedCardNumber: true,
      status: true,
      isCancelled: true,
      cancelPaymentId: true,
      cancelProcessDate: true,
      cancelReason: true,
      paymentStatus: true,
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
  return <OrderDetailsPage order={order} />;
};

export default OrderDetailPage;
