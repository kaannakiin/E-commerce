"use client";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { Button, Modal, NumberInput, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { UserCancelReason } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { Fragment, useState } from "react";
interface OrderItemsRefundProps {
  paymentId: string;
  orderItemId: string;
  quantity: number;
}
const userCancelReasons = [
  { label: "Teslimat adresi hatalı", value: UserCancelReason.WRONG_ADDRESS },
  { label: "Fikir değişikliği", value: UserCancelReason.CHANGED_MIND },
  {
    label: "Daha uygun fiyat buldum",
    value: UserCancelReason.FOUND_BETTER_PRICE,
  },
  {
    label: "Yanlışlıkla sipariş verildi",
    value: UserCancelReason.ACCIDENTAL_ORDER,
  },
  {
    label: "Teslimat süresi çok uzun",
    value: UserCancelReason.DELIVERY_TIME_LONG,
  },
  {
    label: "Ödeme yöntemini değiştirmek istiyorum",
    value: UserCancelReason.PAYMENT_CHANGE,
  },
  {
    label: "Ürün özellikleri beklediğim gibi değil",
    value: UserCancelReason.ITEM_FEATURES,
  },
  {
    label: "Adet değişikliği yapmak istiyorum",
    value: UserCancelReason.QUANTITY_CHANGE,
  },
  { label: "Kişisel nedenler", value: UserCancelReason.PERSONAL_REASON },
  { label: "Diğer", value: UserCancelReason.OTHER },
];
const OrderItemsRefund = (props: OrderItemsRefundProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetchWrapper.post(
        "/user/payment/iyzico/order-managment/refund-order-items",
        {
          paymentId: props.paymentId,
          orderItemId: props.orderItemId,
          reason: selectedReason,
          quantity: quantity,
        },
      );

      setMessage({
        text: response.error || "İade talebiniz başarıyla oluşturuldu.",
        type: "success",
      });

      // Başarılı işlem sonrası 2 saniye bekleyip modalı kapatabilirsiniz
      setTimeout(() => {
        close();
        router.refresh(); // Sayfayı yenilemek için
      }, 2000);
    } catch (error) {
      setMessage({
        text: error.message || "Bir hata oluştu. Lütfen tekrar deneyin.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Button size="xs" color="red" radius={"lg"} onClick={open}>
        İade Talep Et
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        centered
      >
        <div className="space-y-4">
          <Select
            data={userCancelReasons}
            label="İade Nedeni"
            placeholder="Lütfen bir neden seçin"
            value={selectedReason}
            onChange={(value) => {
              setSelectedReason(value);
              setError(null);
              setMessage(null); // Yeni seçim yapıldığında mesajları temizle
            }}
            required
            allowDeselect={false}
            checkIconPosition="right"
            classNames={{
              label: "font-semibold",
            }}
          />
          <NumberInput
            label="İade etmek istediğiniz adet"
            min={1}
            defaultValue={1}
            value={quantity}
            classNames={{
              label: "font-semibold",
            }}
            onChange={(value) => setQuantity(Number(value))}
            max={props.quantity}
          />
          {message && (
            <div
              className={`rounded-md p-4 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <div className="text-sm">{message.text}</div>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="subtle" onClick={close} disabled={loading}>
              Vazgeç
            </Button>
            <Button
              color="red"
              loading={loading}
              disabled={!selectedReason || loading}
              onClick={handleCancel}
            >
              İade Talebi Başlat
            </Button>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
};
export default OrderItemsRefund;