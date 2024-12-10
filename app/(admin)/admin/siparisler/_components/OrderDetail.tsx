"use client";
import CustomImage from "@/components/CustomImage";
import { formattedPrice } from "@/lib/format";
import { getOrderStatusConfig, getRefundStatusConfig } from "@/lib/helper";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  ColorSwatch,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { format } from "date-fns";
import { HiExclamationCircle } from "react-icons/hi";
import { tr } from "date-fns/locale";
import { PiPackage, PiTruck } from "react-icons/pi";
import { RiDiscountPercentLine } from "react-icons/ri";
import { Order } from "../[slug]/page";
import ConfirmOrderButton from "./ConfirmOrderButton";
import { useDisclosure } from "@mantine/hooks";
import { CustomModal } from "@/components/CustomModal";
import RefundModalForm from "./RefundModalForm";
import { useState } from "react";
const OrderDetailsPage = ({ order }: { order: Order }) => {
  const statusConfig = getOrderStatusConfig(order.orderStatus);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const handleOpenModal = (itemId: string) => {
    setSelectedItemId(itemId);
    open();
  };

  const handleCloseModal = () => {
    setSelectedItemId(null);
    close();
  };
  const selectedItem = order.orderItems.find(
    (item) => item.id === selectedItemId,
  );
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
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <Paper
                  key={index}
                  className="bg-gradient-to-r from-white to-gray-50 p-6 transition-all duration-300 sm:p-8"
                >
                  <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="flex w-full flex-1 flex-col gap-6 sm:flex-row">
                      {item.variant.Image?.[0]?.url && (
                        <div className="relative h-32 w-32 overflow-hidden rounded-xl border bg-white p-2 sm:h-24 sm:w-24">
                          <CustomImage
                            src={item.variant.Image[0].url}
                            quality={30}
                            objectFit="contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-4">
                        <div>
                          <Text
                            fw={700}
                            size="lg"
                            className="tracking-wide text-gray-800"
                          >
                            {item.variant.product.name}
                          </Text>
                          {item.refundOrderItemsRequest && (
                            <Group className="flex flex-row items-center">
                              <Text>İade Talebi:</Text>
                              <Badge
                                size="md"
                                fw={600}
                                color={
                                  getRefundStatusConfig(
                                    item.refundOrderItemsRequest.status,
                                  ).color
                                }
                              >
                                {
                                  getRefundStatusConfig(
                                    item.refundOrderItemsRequest.status,
                                  ).text
                                }
                              </Badge>
                              {item.refundOrderItemsRequest.status ===
                                "PENDING" && (
                                <Button
                                  size="xs"
                                  onClick={() => handleOpenModal(item.id)}
                                >
                                  Talebi Onayla
                                </Button>
                              )}
                              {item.refundOrderItemsRequest.status ===
                                "APPROVED" && (
                                <ActionIcon>
                                  <HiExclamationCircle className="h-6 w-6" />
                                </ActionIcon>
                              )}
                              {selectedItem && (
                                <CustomModal
                                  title="Ücret İadesi"
                                  centered
                                  size="lg"
                                  overlayProps={{
                                    backgroundOpacity: 0.55,
                                    blur: 3,
                                  }}
                                  isOpen={opened}
                                  onClose={handleCloseModal}
                                >
                                  <RefundModalForm
                                    item={
                                      selectedItem.refundOrderItemsRequest.id
                                    }
                                    description={
                                      selectedItem.refundOrderItemsRequest
                                        .description
                                    }
                                    reason={
                                      selectedItem.refundOrderItemsRequest
                                        .reason
                                    }
                                    maxQuantity={selectedItem.quantity}
                                    price={selectedItem.price}
                                  />
                                </CustomModal>
                              )}
                            </Group>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {item.variant.type === "COLOR" && (
                            <Group
                              gap="xs"
                              className="inline-flex rounded-full bg-gray-50/80 px-4 py-2"
                            >
                              <Text size="sm" c="dimmed">
                                Renk:
                              </Text>
                              <ColorSwatch
                                color={item.variant.value}
                                size={18}
                                className="shadow-sm"
                              />
                            </Group>
                          )}
                          <Badge
                            size="lg"
                            variant="light"
                            color="blue"
                            radius="xl"
                            className="px-4 shadow-sm"
                          >
                            {item.quantity} Adet
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-row items-end gap-4 sm:w-auto sm:flex-col">
                      <Text fw={700} size="xl" className="text-primary">
                        {item.totalPrice.toFixed(2)} ₺
                      </Text>
                      <Text size="sm" className="text-gray-500">
                        Birim: {item.price.toFixed(2)} ₺
                      </Text>
                    </div>
                  </div>
                </Paper>
              ))}
            </div>
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
