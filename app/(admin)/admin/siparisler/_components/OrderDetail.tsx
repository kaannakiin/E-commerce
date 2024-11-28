"use client";
import CustomImage from "@/components/CustomImage";
import { formattedPrice } from "@/lib/format";
import { getOrderStatusConfig } from "@/lib/helper";
import {
  Badge,
  Card,
  ColorSwatch,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { PiPackage, PiTruck } from "react-icons/pi";
import { RiDiscountPercentLine } from "react-icons/ri";
import { Order } from "../[slug]/page";
import ConfirmOrderButton from "./ConfirmOrderButton";

const OrderDetailsPage = ({ order }: { order: Order }) => {
  const statusConfig = getOrderStatusConfig(order.orderStatus);
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <div className="from-primary/10 to-secondary/10 mb-6 rounded-xl bg-gradient-to-r p-4">
        <Group className="flex-col justify-between gap-4 sm:flex-row">
          <Group>
            <div className="rounded-full bg-white p-2 shadow-sm">
              <PiPackage size={24} className="text-primary" />
            </div>
            <Text fw={600} size="lg">
              Sipariş Detayları
            </Text>
            <span
              className="rounded-full px-3 py-1 text-sm font-bold"
              style={{
                backgroundColor: `${statusConfig.color}15`,
                color: statusConfig.color,
              }}
            >
              {statusConfig.text}
            </span>
          </Group>
          {order.orderStatus === "AWAITING_APPROVAL" && (
            <ConfirmOrderButton orderId={order.id} />
          )}
        </Group>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Sipariş Bilgileri */}
        <Card withBorder padding="lg" radius="md" className="space-y-3">
          <div className="flex flex-row justify-between">
            <p className="text-lg font-medium">Sipariş Tarihi</p>
            <p className="text-lg font-medium">
              {format(new Date(order.createdAt), "dd MMMM yyyy eeee", {
                locale: tr,
              })}
            </p>
          </div>{" "}
          <div className="flex flex-row justify-between">
            <p className="text-lg font-medium">Sipariş Numarası</p>
            <p className="text-lg font-medium">{order.orderNumber}</p>
          </div>
        </Card>
        {order.user && (
          <Card withBorder padding="md" h={300}>
            <Stack gap="md">
              <Text
                ta="center"
                fw={700}
                size="lg"
                className="border-b border-gray-200 pb-2"
              >
                Müşteri Bilgileri
              </Text>
              <div className="space-y-3">
                <InfoRow label="Adı" value={order.user.name} />
                <InfoRow label="Soyadı" value={order.user.surname} />
                <InfoRow label="Telefon" value={order.user.phone} />
                <InfoRow label="Email" value={order.user.email} />
              </div>
            </Stack>
          </Card>
        )}
        {/* Teslimat Adresi */}
        <div>
          <Card withBorder padding="md" h={300}>
            <Stack gap="md">
              <Text
                ta="center"
                fw={700}
                size="lg"
                className="border-b border-gray-200 pb-2"
              >
                Teslimat Adresi
              </Text>
              <div className="space-y-3">
                <InfoRow label="Adı" value={order.address.name} />
                <InfoRow label="Soyadı" value={order.address.surname} />
                <InfoRow label="Email" value={order.address.email} />
                <InfoRow label="Telefon" value={order.address.phone} />
                <InfoRow
                  label="Adres"
                  value={`${order.address.addressDetail} ${order.address.district}/${order.address.city}`}
                />
              </div>
            </Stack>
          </Card>
        </div>
        {/* Sipariş Özeti */}
      </div>
      <div className="w-full">
        <Card withBorder padding="md">
          <Title order={4} mb="md">
            <Group>
              <PiTruck size={20} />
              <Text>Sipariş Özeti</Text>
            </Group>
          </Title>
          <Stack>
            {order.orderItems.map((item, index) => (
              <Paper
                key={index}
                p="lg"
                withBorder
                shadow="sm"
                radius="md"
                className="hover:border-primary/20 bg-gradient-to-r from-white to-gray-50 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex flex-1 flex-row gap-4">
                    {item.variant.Image?.[0]?.url && (
                      <div className="relative hidden h-20 w-20 overflow-hidden rounded-lg border bg-white p-1 sm:block">
                        <CustomImage
                          src={item.variant.Image[0].url}
                          quality={20}
                          objectFit="contain"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <Text
                        fw={600}
                        className="mb-2 tracking-wide text-gray-800"
                      >
                        {item.variant.product.name}
                      </Text>

                      <div className="space-y-2">
                        {item.variant.type === "COLOR" && (
                          <Group
                            gap="xs"
                            className="inline-flex rounded-full bg-gray-50 px-3 py-1.5"
                          >
                            <Text size="sm" c="dimmed">
                              Renk:
                            </Text>
                            <ColorSwatch
                              color={item.variant.value}
                              size={16}
                              className="shadow-sm"
                            />
                          </Group>
                        )}

                        <Badge
                          size="md"
                          variant="light"
                          color="blue"
                          radius="xl"
                          className="shadow-sm"
                        >
                          {item.quantity} Adet
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-4">
                    <div className="text-right">
                      <Text fw={700} size="lg" className="text-primary">
                        {item.totalPrice.toFixed(2)} ₺
                      </Text>
                      <Text size="sm" className="text-gray-500">
                        Birim: {item.price.toFixed(2)} ₺
                      </Text>
                    </div>
                  </div>
                </div>
              </Paper>
            ))}
            <div className="from-primary/5 to-secondary/5 mt-6 rounded-xl bg-gradient-to-r p-4">
              <div className="flex flex-col gap-4">
                {/* Discount Code Section */}
                {order.discountCode && (
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <Group className="justify-center lg:justify-start">
                      <div className="rounded-full bg-white p-2 shadow-sm">
                        <RiDiscountPercentLine
                          size={24}
                          className="text-primary"
                        />
                      </div>
                      <Text fw={600} size="lg">
                        İndirim Kodu: {order.discountCode.code.toString()}
                      </Text>
                    </Group>

                    <Text
                      fw={600}
                      size="lg"
                      className="text-center lg:text-right"
                    >
                      {order.discountCode.discountType === "FIXED"
                        ? `İndirim Tutarı: ${formattedPrice(order.discountCode.discountAmount)}`
                        : `İndirim: ${formattedPrice((order.orderItems.reduce((a, b) => a + b.price, 0) * order.discountCode.discountAmount) / 100)}`}
                    </Text>
                  </div>
                )}

                {/* Price Summary Section */}
                <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Text
                      fw={700}
                      size="xl"
                      className="text-center lg:text-left"
                    >
                      Kazancınız: {formattedPrice(order.paidPriceIyzico)}
                    </Text>
                    <Text fw={700} size="xl" className="text-center">
                      iyzico komisyon:{" "}
                      {formattedPrice(order.paidPrice - order.paidPriceIyzico)}
                    </Text>
                    <Text
                      fw={700}
                      size="xl"
                      className="text-center lg:text-right"
                    >
                      Toplam: {formattedPrice(order.paidPrice)}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Stack>
        </Card>
      </div>
    </div>
  );
};
const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-2">
    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <Text className="min-w-[80px] font-medium text-gray-600">{label}:</Text>
      <Text className="flex-1">{value}</Text>
    </div>
  </div>
);
export default OrderDetailsPage;
