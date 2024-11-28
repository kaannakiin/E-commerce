import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import React from "react";
import OrderHeader from "../_components/OrderHeader";
import CustomImage from "@/components/CustomImage";
import OrderItemsCard from "../_components/OrderItemsCard";

const OrderPage = async (props: { params: Params }) => {
  const params = await props.params;
  const order = await prisma.order.findUnique({
    where: {
      orderNumber: params.slug,
    },
    select: {
      createdAt: true,
      currency: true,
      orderNumber: true,
      orderStatus: true,
      paidPrice: true,
      orderItems: {
        select: {
          price: true,
          quantity: true,
          totalPrice: true,
          variant: {
            select: {
              id: true,
              price: true,
              discount: true,
              isPublished: true,
              product: {
                select: {
                  name: true,
                  shortDescription: true,
                  description: true,
                  taxRate: true,
                  id: true,
                },
              },
              Image: {
                select: {
                  url: true,
                  alt: true,
                },
              },
              value: true,
              unit: true,
              type: true,
            },
          },
        },
      },
      address: {
        select: {
          name: true,
          surname: true,
          addressDetail: true,
          email: true,
          phone: true,
          city: true,
          district: true,
        },
      },
    },
  });
  const quantitySum = order.orderItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  return (
    <div className="flex w-full flex-col gap-2">
      <OrderHeader
        createdAt={order.createdAt}
        orderNumber={order.orderNumber}
        orderStatus={order.orderStatus}
        paidPrice={order.paidPrice}
        quantitySum={quantitySum}
      />
      <OrderItemsCard order={order.orderItems} />
    </div>
  );
};
// temporarily defaulting to concise responses
export default OrderPage;
