import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import React from "react";
import OrderDetailsPage from "../_components/OrderDetail";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
export type Order = Prisma.OrderGetPayload<{
  select: {
    id: true;
    createdAt: true;
    orderNumber: true;
    paidPriceIyzico: true;
    paymentId: true;
    paidPrice: true;
    orderStatus: true;
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
    orderItems: {
      select: {
        id: true;
        refunded: true;
        refundDate: true;
        refundOrderItemsRequest: true;
        quantity: true;
        price: true;
        totalPrice: true;
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
const feedPage = async (slug: string) => {
  const order = await prisma.order.findUnique({
    where: {
      orderNumber: slug,
    },
    select: {
      id: true,
      createdAt: true,
      orderNumber: true,
      paidPriceIyzico: true,
      paymentId: true,
      paidPrice: true,
      orderStatus: true,
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
      orderItems: {
        select: {
          id: true,
          refunded: true,
          refundDate: true,
          refundOrderItemsRequest: true,
          quantity: true,
          price: true,
          totalPrice: true,
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
