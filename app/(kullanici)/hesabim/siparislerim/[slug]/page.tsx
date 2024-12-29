import OrderItemsCard from "@/app/(kullanici)/siparis/[slug]/_components/OrderItemsCard";
import PaymentInfoCard from "@/app/(kullanici)/siparis/[slug]/_components/PaymentInfoCard";
import UserInfoCard from "@/app/(kullanici)/siparis/[slug]/_components/UserInfoCard";
import { formatOrderStatus, formattedPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import { Badge, Card, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { OrderStatus } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { notFound } from "next/navigation";
import { cache, Fragment } from "react";
import {
  TbCalendar,
  TbCreditCard,
  TbDiscount,
  TbPackage,
} from "react-icons/tb";
import CancelOrderButton from "../_components/CancelOrderButton";

const feedPage = cache(async (slug: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        orderNumber: slug,
      },
      select: {
        orderNumber: true,
        userId: true,
        address: true,
        cardAssociation: true,
        maskedCardNumber: true,
        cardFamily: true,
        cardType: true,
        discountCode: true,
        createdAt: true,
        isCancelled: true,
        paymentDate: true,
        ip: true,
        paymentId: true,
        paymentStatus: true,
        total: true,
        status: true,
        cancelProcessDate: true,
        cancelReason: true,
        OrderItems: {
          select: {
            id: true,
            price: true,
            quantity: true,
            variant: {
              select: {
                id: true,
                type: true,
                value: true,
                price: true,
                slug: true,
                discount: true,
                stock: true,
                createdAt: true,
                isPublished: true,
                softDelete: true,
                unit: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    taxRate: true,
                    description: true,
                  },
                },
                Image: {
                  select: {
                    url: true,
                    alt: true,
                  },
                },
              },
            },
            isRefunded: true,
            refundAmount: true,
            refundStatus: true,
            refundRequestDate: true,
            refundReason: true,
          },
        },
      },
    });
    if (!order) return notFound();
    return order;
  } catch (error) {
    return notFound();
  }
});
const page = async (params: { params: Params }) => {
  const slug = (await params.params).slug;
  const order = await feedPage(slug);
  const OrderSameDay = isSameDay(new Date(order.createdAt), new Date());
  return (
    <div className="flex flex-col gap-5 p-5 lg:p-10">
      <div className="flex flex-row items-center justify-between">
        <Title c={"secondary.9"} order={3}>
          Sipariş Detayları
        </Title>
        {OrderSameDay &&
          order.paymentStatus === "SUCCESS" &&
          order.status !== "COMPLETED" &&
          order.status !== "CANCELLED" &&
          order.status !== "SHIPPED" &&
          !order.isCancelled && (
            <CancelOrderButton ip={order.ip} paymentId={order.paymentId} />
          )}
      </div>
      <div className="grid gap-2 lg:grid-cols-3 lg:gap-4">
        <Card withBorder padding="lg" shadow="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="xs">
                <TbPackage size={20} color="#666666" />
                <Text fw={500}>Sipariş No: {order.orderNumber}</Text>
              </Group>
              <Badge
                color={getStatusColor(order.status).text}
                c={getStatusColor(order.status).bg}
              >
                {formatOrderStatus(order.status)}
              </Badge>
            </Group>

            <Divider />

            <Group gap="xs">
              <TbCalendar size={20} color="#666666" />
              <Text>
                {format(new Date(order.createdAt), "dd MMMM yyyy EEEE", {
                  locale: tr,
                })}
              </Text>
            </Group>
            {order.discountCode && (
              <Fragment>
                <Group gap="xs">
                  <TbDiscount size={20} color="#666666" />
                  <Stack gap={4}>
                    <Text fw={500}>
                      İndirim Kodu: {order.discountCode.code}
                    </Text>
                    <Text size="sm" c="dimmed">
                      İndirim Tutarı:{" "}
                      <Text span fw={500} c="green">
                        {order.discountCode.discountType === "PERCENTAGE"
                          ? formattedPrice(
                              (order.total * 100) /
                                (100 - order.discountCode.discountAmount) -
                                order.total,
                            )
                          : formattedPrice(order.discountCode.discountAmount)}
                      </Text>
                    </Text>
                  </Stack>
                </Group>
              </Fragment>
            )}
            <Divider />
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs">
                <TbCreditCard size={20} color="#666666" />
                <Text>Sepet Tutarı</Text>
              </Group>
              <Text size="xl" fw={700}>
                {formattedPrice(order.total)}
              </Text>
            </Group>
          </Stack>
        </Card>
        <UserInfoCard
          addressDetail={order.address.addressDetail}
          addressTitle={order.address.addressTitle}
          city={order.address.city}
          distirct={order.address.district}
          email={order.address.email}
          name={order.address.name}
          phone={order.address.phone}
          surname={order.address.surname}
        />
        <PaymentInfoCard
          cancelProcessDate={order.cancelProcessDate}
          cancelReason={order.cancelReason}
          isCancelled={order.isCancelled}
          maskedCardNumber={order.maskedCardNumber}
          paymentDate={order.paymentDate}
          paymentStatus={order.paymentStatus}
        />
      </div>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {order.OrderItems.map((item, index) => {
          return (
            <OrderItemsCard
              key={index}
              isCancelled={order.isCancelled}
              paymentStatus={order.paymentStatus}
              price={item.price}
              id={item.id}
              quantity={item.quantity}
              variant={item.variant}
              refundAmount={item.refundAmount}
              refundReason={item.refundReason}
              refundRequestDate={item.refundRequestDate}
              refundStatus={item.refundStatus}
              isRefunded={item.isRefunded}
              isSameDay={OrderSameDay}
              orderStatus={order.status}
              paymentId={order.paymentId}
            />
          );
        })}
      </div>
    </div>
  );
};

export default page;
const getStatusColor = (status: OrderStatus) => {
  const colors = {
    PENDING: { bg: "#FEF3C7", text: "#92400E" }, // Amber
    PROCESSING: { bg: "#DBEAFE", text: "#1E40AF" }, // Blue
    SHIPPED: { bg: "#E0F2FE", text: "#075985" }, // Light Blue
    COMPLETED: { bg: "#DCFCE7", text: "#166534" }, // Green
    CANCELLED: { bg: "#FEE2E2", text: "#991B1B" }, // Red
  };
  return colors[status] || { bg: "#F3F4F6", text: "#374151" }; // Default gray
};
