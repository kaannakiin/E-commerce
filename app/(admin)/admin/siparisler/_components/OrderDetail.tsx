"use client";
import {
  PiPackage,
  PiUser,
  PiMapPin,
  PiTruck,
  PiCalendar,
  PiCreditCard,
  PiEnvelope,
  PiPhone,
} from "react-icons/pi";
import { HiMiniReceiptRefund } from "react-icons/hi2";
import { IoClose, IoArrowBack, IoCheckmark } from "react-icons/io5";
import React, { useState, useEffect } from "react";
import {
  Paper,
  Grid,
  Title,
  Text,
  Stack,
  Group,
  Card,
  Badge,
  ActionIcon,
  Modal,
  NumberInput,
  Button,
  Select,
  Switch,
  ColorSwatch,
} from "@mantine/core";
import { OrderStatus, VariantType } from "@prisma/client";
import CustomImage from "@/components/CustomImage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { returnFormSchema, ReturnFormValues } from "@/zodschemas/authschema";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { OrderFormat } from "@/lib/helper";
import ConfirmOrderButton from "./ConfirmOrderButton";
import { fetchWrapper } from "@/lib/fetchWrapper";
interface Order {
  id: string;
  orderNumber: string;
  paymentId: string;
  basketId: string;
  paidPrice: number;
  orderStatus: OrderStatus;
  createdAt: Date;
  address: {
    name: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    addressDetail: string;
  };
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    totalPrice: number;
    variant: {
      value: string;
      unit: string | null;
      type: VariantType;
      Image: {
        url: string;
      }[];
      product: {
        name: string;
      };
    };
  }[];
}
interface ReturnFormProps {
  item: Order["orderItems"][0] | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReturnFormValues) => void;
}
const ReturnForm = ({ item, open, onClose, onSubmit }: ReturnFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      quantity: 1,
      amount: item?.price || 0,
      reason: "",
    },
  });
  const returnReasons = [
    { value: "wrong-size", label: "Beden/Ölçü Uyumsuzluğu" },
    { value: "damaged", label: "Hasarlı/Defolu Ürün" },
    { value: "not-as-described", label: "Ürün Tanıtımı ile Uyumsuz" },
    { value: "wrong-item", label: "Yanlış Ürün Gönderimi" },
    { value: "other", label: "Diğer" },
  ];

  const [autoCalculate, setAutoCalculate] = useState(true);
  const quantity = watch("quantity");

  useEffect(() => {
    if (!open) {
      reset({
        quantity: 1,
        amount: item?.price || 0,
        reason: "",
      });
    }
  }, [open, reset, item?.price]);

  // Item değiştiğinde veya quantity değiştiğinde amount'u güncelle
  useEffect(() => {
    if (autoCalculate && item?.price) {
      setValue("amount", quantity * item.price);
    }
  }, [quantity, item?.price, autoCalculate, setValue]);

  const handleModalClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      opened={open}
      onClose={handleModalClose}
      title={
        <Text size="lg" fw={700} ta="center">
          ÜRÜN İADE FORMU
        </Text>
      }
      centered
      closeButtonProps={{
        icon: <IoClose size={20} />,
      }}
      size="md"
    >
      <Card withBorder p="md" radius="md" mb="md">
        <div className="flex flex-1 flex-row gap-4">
          {/* Ürün Görseli - varsa */}
          {item.variant.Image?.[0]?.url && (
            <div className="relative hidden h-20 w-20 sm:block">
              <CustomImage src={item.variant.Image[0].url} quality={20} />
            </div>
          )}

          {/* Ürün Bilgileri */}
          <div className="flex-1">
            <Text fw={600} className="mb-1 uppercase text-gray-800">
              {item.variant.product.name}
            </Text>

            <div className="mb-2 space-y-1">
              {item.variant.type === "COLOR" && (
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    Renk:
                  </Text>
                  <ColorSwatch color={item.variant.value} size={16} />
                </Group>
              )}

              {item.variant.type === "SIZE" && (
                <Text size="sm" c="dimmed">
                  Beden:{" "}
                  <span className="font-medium">{item.variant.value}</span>
                </Text>
              )}

              {item.variant.type === "WEIGHT" && (
                <Text size="sm" c="dimmed">
                  Ağırlık:{" "}
                  <span className="font-medium">
                    {item.variant.value} {item.variant.unit}
                  </span>
                </Text>
              )}
            </div>

            <Badge
              size="md"
              variant="light"
              color="blue"
              radius="sm"
              className="mt-1"
            >
              {item.quantity} Adet
            </Badge>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <NumberInput
          label="İade Adedi"
          description="İade etmek istediğiniz ürün adedini giriniz"
          {...register("quantity", { valueAsNumber: true })}
          onChange={(value) => setValue("quantity", value as number)}
          error={errors.quantity?.message}
          min={1}
          max={item?.quantity || 99}
          mb="md"
          required
        />

        <Select
          label="İade Nedeni"
          description="Lütfen iade nedenini seçiniz"
          data={returnReasons}
          error={errors.reason?.message}
          value={watch("reason") || null} // null değerini ekleyin
          onChange={(value) => setValue("reason", value || "")} // boş string olarak ayarlayın
          searchable
          clearable
          mb="md"
          required
        />

        <Group justify="space-between" mb="md">
          <Text size="sm">Otomatik Tutar Hesaplama</Text>
          <Switch
            checked={autoCalculate}
            onChange={(event) => {
              setAutoCalculate(event.currentTarget.checked);
              if (event.currentTarget.checked && item?.price) {
                setValue("amount", quantity * item.price);
              }
            }}
          />
        </Group>

        <NumberInput
          label="İade Tutarı"
          description={
            autoCalculate
              ? "Tutar otomatik hesaplanıyor"
              : "İade tutarını manuel girebilirsiniz"
          }
          error={errors.amount?.message}
          value={watch("amount")}
          onChange={(value) => setValue("amount", (value as number) || 0)} // undefined durumu için 0
          min={0}
          max={99999999} // number olarak max değer belirleyin
          suffix="₺"
          disabled={autoCalculate}
          mb="xl"
          required
        />

        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IoArrowBack />}
            onClick={handleModalClose}
          >
            İptal
          </Button>
          <Button
            variant="filled"
            color="blue"
            leftSection={<IoCheckmark />}
            type="submit"
          >
            İade Talebini Gönder
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

const OrderDetailsPage = ({ order }: { order: Order }) => {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    Order["orderItems"][0] | null
  >(null);
  const handleReturnSubmit = async (data: ReturnFormValues) => {
    try {
      await fetchWrapper.post("/admin/iade/tutar-iade", {
        data: data,
        paymentId: order.paymentId,
      });
    } catch (error) {
      return error;
    }
    // Form submission logic here
    setOpen(false);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <div className="mb-4 flex flex-row items-center justify-between">
        <Group>
          <PiPackage size={24} />
          <Text>Sipariş Detayları</Text>
          <Badge
            size="md"
            variant="gradient"
            gradient={{ from: "primary", to: "secondary", deg: 90 }}
          >
            {OrderFormat(order.orderStatus)}
          </Badge>
        </Group>
        {order.orderStatus === "PENDING" && (
          <ConfirmOrderButton orderId={order.id} />
        )}
      </div>

      <Grid gutter="md">
        {/* Sipariş Bilgileri */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="md">
            <Title order={4} mb="md">
              <Group>
                <PiPackage size={20} />
                <Text>
                  Sipariş Tarihi:{" "}
                  {format(new Date(order.createdAt), "dd MMMM yyyy eeee", {
                    locale: tr,
                  })}
                </Text>
              </Group>
            </Title>
            <Stack>
              <Group>
                <PiCalendar size={18} color="gray" />
                <Text>Sipariş No: {order.orderNumber}</Text>
              </Group>
              <Group>
                <PiCreditCard size={18} color="gray" />
                <Text>Ödeme ID: {order.paymentId}</Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Müşteri Bilgileri */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="md">
            <Title order={4} mb="md">
              <Group>
                <PiUser size={20} />
                <Text>Müşteri Bilgileri</Text>
              </Group>
            </Title>
            <Stack>
              <Group>
                <PiUser size={18} color="gray" />
                <Text>{order.address.name}</Text>
              </Group>
              <Group>
                <PiEnvelope size={18} color="gray" />
                <Text>{order.address.email}</Text>
              </Group>
              <Group>
                <PiPhone size={18} color="gray" />
                <Text>{order.address.phone}</Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Teslimat Adresi */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="md">
            <Title order={4} mb="md">
              <Group>
                <PiMapPin size={20} />
                <Text>Teslimat Adresi</Text>
              </Group>
            </Title>
            <Group align="flex-start">
              <PiMapPin size={18} color="gray" style={{ marginTop: 4 }} />
              <Text>
                {order.address.addressDetail}
                <br />
                {order.address.district}, {order.address.city}
              </Text>
            </Group>
          </Card>
        </Grid.Col>

        {/* Sipariş Özeti */}
        <Grid.Col span={{ base: 12, md: 6 }}>
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
                  key={item.id}
                  p="md"
                  withBorder
                  shadow="xs"
                  radius="md"
                  className="transition-shadow duration-200 hover:shadow-md"
                >
                  <div className="flex flex-row items-center justify-between gap-4">
                    {/* Sol Kısım - Ürün Detayları */}
                    <div className="flex flex-1 flex-row gap-4">
                      {/* Ürün Görseli - varsa */}
                      {item.variant.Image?.[0]?.url && (
                        <div className="relative hidden h-20 w-20 sm:block">
                          <CustomImage
                            src={item.variant.Image[0].url}
                            quality={20}
                            objectFit="contain"
                          />
                        </div>
                      )}

                      {/* Ürün Bilgileri */}
                      <div className="flex-1">
                        <Text fw={600} className="mb-1 uppercase text-gray-800">
                          {item.variant.product.name}
                        </Text>

                        <div className="mb-2 space-y-1">
                          {item.variant.type === "COLOR" && (
                            <Group gap="xs">
                              <Text size="sm" c="dimmed">
                                Renk:
                              </Text>
                              <ColorSwatch
                                color={item.variant.value}
                                size={16}
                              />
                            </Group>
                          )}

                          {item.variant.type === "SIZE" && (
                            <Text size="sm" c="dimmed">
                              Beden:{" "}
                              <span className="font-medium">
                                {item.variant.value}
                              </span>
                            </Text>
                          )}

                          {item.variant.type === "WEIGHT" && (
                            <Text size="sm" c="dimmed">
                              Ağırlık:{" "}
                              <span className="font-medium">
                                {item.variant.value} {item.variant.unit}
                              </span>
                            </Text>
                          )}
                        </div>

                        <Badge
                          size="md"
                          variant="light"
                          color="blue"
                          radius="sm"
                          className="mt-1"
                        >
                          {item.quantity} Adet
                        </Badge>
                      </div>
                    </div>

                    {/* Sağ Kısım - Fiyat ve İade */}
                    <div className="flex flex-row items-center gap-3">
                      {/* Fiyat Bilgileri */}
                      <div className="text-right">
                        <Text fw={700} size="lg" className="text-gray-900">
                          {item.totalPrice.toFixed(2)} ₺
                        </Text>
                        <Text size="sm" c="dimmed">
                          Birim: {item.price.toFixed(2)} ₺
                        </Text>
                      </div>

                      {/* İade Butonu */}
                      <ActionIcon
                        color="red"
                        variant="light"
                        size="lg"
                        radius="md"
                        className="transition-colors duration-200 hover:bg-red-50"
                        onClick={() => {
                          setSelectedItem(item);
                          setOpen(true);
                        }}
                      >
                        <HiMiniReceiptRefund size={20} />
                      </ActionIcon>
                    </div>
                  </div>
                </Paper>
              ))}
              <div className="flex w-full flex-row items-center justify-between">
                <Text fw={700}>Toplam: {order.paidPrice.toFixed(2)} ₺</Text>
                <Button>
                  <Text>İade Talebi Oluştur</Text>
                </Button>
              </div>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {selectedItem && (
        <ReturnForm
          item={selectedItem}
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedItem(null);
          }}
          onSubmit={handleReturnSubmit}
        />
      )}
    </div>
  );
};

export default OrderDetailsPage;
