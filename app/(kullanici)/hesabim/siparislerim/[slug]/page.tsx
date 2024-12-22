import CustomImage from "@/components/CustomImage";
import {
  formatOrderStatus,
  formatPaymentStatus,
  formatRefundStatus,
  formattedDate,
  formattedPrice,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Params } from "@/types/types";
import {
  Card,
  ColorSwatch,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { Prisma, VariantType } from "@prisma/client";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  FaCreditCard,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import CancelButton from "../_components/CancelButton";
import ReBuyButton from "../_components/ReBuyButton";
import { isSameDay } from "date-fns";
import RefundButton from "../_components/RefundButton";
import { isWithinRefundPeriod } from "@/lib/İyzico/helper/helper";
export type CancelButtonProps = Prisma.OrderGetPayload<{
  select: {
    paymentDate: true;
    createdAt: true;
    status: true;
    paymentStatus: true;
    paymentId: true;
  };
}>;
const feedPage = cache(async (slug: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        orderNumber: slug,
      },
      select: {
        address: {
          select: {
            addressDetail: true,
            city: true,
            district: true,
            phone: true,
            name: true,
            surname: true,
          },
        },
        maskedCardNumber: true,
        discountCode: true,
        paymentStatus: true,
        orderNumber: true,
        status: true,
        cardAssociation: true,
        cardFamily: true,
        paymentDate: true,
        cardType: true,
        createdAt: true,
        paymentId: true,
        isCancelled: true,
        total: true,
        OrderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            isRefunded: true,
            refundReason: true,
            refundRequestDate: true,
            refundStatus: true,
            variant: {
              select: {
                unit: true,
                product: {
                  select: {
                    shortDescription: true,
                    name: true,
                    id: true,
                    taxRate: true,
                  },
                },
                id: true,
                value: true,
                type: true,
                discount: true,
                Image: {
                  select: {
                    url: true,
                    alt: true,
                  },
                },
                price: true,
              },
            },
          },
        },
      },
    });
    if (!order) return null;
    return order;
  } catch (error) {}
});
const page = async (params: { params: Params }) => {
  const slug = (await params.params).slug;
  const data = await feedPage(slug);
  if (!data) {
    notFound();
  }
  const summaryItems = [
    {
      label: "Sipariş Tarihi",
      value: formattedDate(data.createdAt.toISOString()),
    },
    {
      label: "Sipariş No",
      value: data.orderNumber,
    },
    {
      label: "Sipariş Özeti",
      value: `${data.OrderItems.length} adet ürün`,
    },
    { label: "Sipariş Durumu", value: formatOrderStatus(data.status) },
  ];
  return (
    <div className="flex w-full flex-col gap-4">
      <Card withBorder shadow="sm" p="md">
        <Stack gap="md">
          <Text fw={700} size="xl" className="md:hidden">
            Sipariş Özeti
          </Text>

          <Group
            justify="space-between"
            align="center"
            className="hidden md:flex"
          >
            <Text fw={700} size="xl">
              Sipariş Özeti
            </Text>
            {summaryItems.map((item, index) => (
              <Stack key={index} gap={4}>
                <Text size="sm" c="dimmed">
                  {item.label}
                </Text>
                <Text size="sm">{item.value}</Text>
              </Stack>
            ))}
          </Group>

          {/* Mobile görünüm için grid */}
          <SimpleGrid cols={2} className="md:hidden">
            {summaryItems.map((item, index) => (
              <Stack key={index} gap={4}>
                <Text size="sm" c={"dimmed"}>
                  {item.label}
                </Text>
                <Text size="sm">{item.value}</Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Stack>
      </Card>
      <div className="flex flex-row justify-end">
        {data.status === "CANCELLED" && (
          <Text c="red">Sipariş iptal edildi</Text>
        )}
        {isSameDay(data.paymentDate, new Date()) &&
          data.status === "PROCESSING" &&
          data.paymentStatus === "SUCCESS" && (
            <CancelButton
              props={{
                createdAt: data.createdAt,
                paymentDate: data.paymentDate,
                paymentId: data.paymentId,
                paymentStatus: data.paymentStatus,
                status: data.status,
              }}
            />
          )}
      </div>
      <div className="flex flex-col justify-between gap-4 lg:flex-row">
        <DeliveryAddressCard address={data.address} />
        <Card withBorder shadow="sm" p="md" className="sm:w-full md:w-1/2">
          <Stack gap="md">
            <Text fw={700} c="blue.9">
              Ödeme Bilgileri
            </Text>

            <Stack gap="sm">
              <Group gap="sm">
                <FaCreditCard size={16} className="text-primary-400" />
                <Stack gap={4}>
                  <Text>{data.maskedCardNumber}</Text>
                </Stack>
              </Group>

              <Group gap="sm">
                <FaMoneyBill size={16} className="text-primary-400" />
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">
                    Toplam Tutar
                  </Text>
                  <Text fw={500}>{formattedPrice(data.total)}</Text>
                </Stack>
              </Group>
              <Group gap="sm">
                <FaMoneyBill size={16} className="text-primary-400" />
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">
                    Ödeme durumu{" "}
                  </Text>
                  <Text fw={500}>
                    {formatPaymentStatus(data.paymentStatus)}
                  </Text>
                </Stack>
              </Group>
            </Stack>
          </Stack>
        </Card>
      </div>
      <div className="mt-4 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        {data.OrderItems &&
          data.OrderItems.map((item, index) => (
            <div
              className="flex flex-row gap-2 rounded-md border p-4 shadow-sm"
              key={index}
            >
              {item.variant.Image && (
                <div className="relative h-24 w-24">
                  <CustomImage
                    src={item.variant.Image[0].url}
                    quality={20}
                    objectFit="cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col">
                <div>
                  <span className="flex flex-row items-center gap-2">
                    <p className="line-clamp-1 text-sm font-medium">
                      {item.variant.product.name}
                    </p>
                    {getVariantLabel({
                      type: item.variant.type,
                      value: item.variant.value,
                      unit: item.variant.unit,
                    })}
                  </span>
                  <p className="line-clamp-1 text-sm text-gray-600">
                    {item.variant.product.shortDescription}
                  </p>
                </div>
                <div className="mt-2 flex w-full flex-col justify-between gap-2 lg:flex-row lg:items-center lg:gap-0">
                  <div className="flex flex-row items-center gap-4">
                    <p className="font-bold text-primary-900">
                      {formattedPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-row justify-between gap-2 lg:justify-end">
                    {!data.isCancelled &&
                      !isSameDay(data.paymentDate, new Date()) &&
                      !item.isRefunded &&
                      isWithinRefundPeriod(data.paymentDate) &&
                      data.status === "COMPLETED" &&
                      data.paymentStatus === "SUCCESS" &&
                      !item.refundReason && (
                        <RefundButton orderItemsId={item.id} />
                      )}
                    <ReBuyButton
                      variant={{
                        id: item.variant.id,
                        price: item.variant.price,
                        type: item.variant.type,
                        value: item.variant.value,
                        unit: item.variant.unit,
                        discount: item.variant.discount,
                        stock: 1,
                        product: {
                          id: item.variant.product.id,
                          name: item.variant.product.name,
                          description: item.variant.product.shortDescription,
                          taxRate: item.variant.product.taxRate,
                        },
                        Image: item.variant.Image.map((image) => ({
                          url: image.url,
                          alt: image.alt,
                        })),
                      }}
                    />
                  </div>
                </div>{" "}
                <div>
                  {item.refundReason && (
                    <Text
                      size="xs"
                      className="font-bold"
                      c={formatRefundStatus(item.refundStatus).color}
                    >
                      {formatRefundStatus(item.refundStatus).text}
                    </Text>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default page;
interface VariantItem {
  type: VariantType;
  value: string;
  unit?: string;
}
const getVariantLabel = ({ type, value, unit }: VariantItem) => {
  switch (type) {
    case VariantType.COLOR:
      return (
        <div className="flex items-center gap-2">
          <ColorSwatch color={value} size={16} className="shadow-sm" />
        </div>
      );

    case VariantType.SIZE:
      return (
        <span className="rounded-md bg-gray-50 px-2 py-0.5 text-sm font-medium">
          {value}
        </span>
      );

    case VariantType.WEIGHT:
      return (
        <span className="rounded-md bg-gray-50 px-2 py-0.5 text-sm font-medium">
          {value} {unit}
        </span>
      );

    default:
      return null;
  }
};
const DeliveryAddressCard = ({ address }) => (
  <Card withBorder shadow="sm" p="md" className="sm:w-full md:w-1/2">
    <Stack gap="md">
      <Text fw={700} c="blue.9">
        Teslimat Adresi
      </Text>

      <Stack gap="sm">
        <Group gap="sm">
          <FaUser size={16} className="text-primary-400" />
          <Text>
            {address.name.charAt(0).toLocaleUpperCase() + address.name.slice(1)}{" "}
            {address.surname.charAt(0).toLocaleUpperCase() +
              address.surname.slice(1)}
          </Text>
        </Group>

        <Group gap="sm">
          <FaPhone size={16} className="text-primary-400" />
          <Text>{address.phone}</Text>
        </Group>

        <Group gap="sm" align="flex-start">
          <FaMapMarkerAlt size={16} className="text-primary-400" />
          <Stack gap={4}>
            <Text>{address.addressDetail}</Text>
            <Text size="sm" c="dimmed">
              {address.city} / {address.district}
            </Text>
          </Stack>
        </Group>
      </Stack>
    </Stack>
  </Card>
);
