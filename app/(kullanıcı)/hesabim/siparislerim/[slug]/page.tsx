import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { notFound } from "next/navigation";
import OrderHeader from "../_components/OrderHeader";
import OrderItemsCard from "../_components/OrderItemsCard";

const OrderPage = async (props: { params: Params }) => {
  const params = await props.params;
  const order = await prisma.order.findUnique({
    where: {
      orderNumber: params.slug,
    },
    select: {
      user: {
        select: {
          id: true,
        },
      },
      createdAt: true,
      currency: true,
      orderNumber: true,
      orderStatus: true,
      paymentId: true,
      paidPrice: true,
      paymentStatus: true,
      ip: true,
      deliveredDate: true,
      id: true,
      orderItems: {
        select: {
          id: true,
          price: true,
          quantity: true,
          totalPrice: true,
          createdAt: true,
          refundOrderItemsRequest: true,
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
  const session = await auth();
  if (order.user?.id !== session.user.id) {
    return notFound();
  }
  return (
    <div className="flex w-full flex-col gap-2">
      <OrderHeader
        createdAt={order.createdAt}
        orderNumber={order.orderNumber}
        orderStatus={order.orderStatus}
        paidPrice={order.paidPrice}
        deliveredAt={order.deliveredDate}
        quantitySum={quantitySum}
      />
      <OrderItemsCard
        order={order.orderItems}
        paymentStatus={order.paymentStatus}
        orderStatus={order.orderStatus}
        deliveredDate={order.deliveredDate}
      />
    </div>
  );
};
// temporarily defaulting to concise responses
export default OrderPage;
