"use client";
import { Button, Modal, Select } from "@mantine/core";
import { Fragment, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { UserCancelReason } from "@prisma/client";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { useRouter } from "next/navigation";

interface CancelOrderButtonProps {
  ip: string;
  paymentId: string;
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

const CancelOrderButton = (props: CancelOrderButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWrapper.post(
        "/user/payment/iyzico/order-managment/cancel-order",
        {
          paymentId: props.paymentId,
          cancelReason: selectedReason,
          ip: props.ip,
        },
      );

      if (response.status === 200) {
        router.refresh();
        close();
      } else {
        setError(response.error || "Sipariş iptal edilirken bir hata oluştu.");
      }
    } catch (error) {
      setError(
        "Sipariş iptal edilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Button color="red" onClick={open} size="xs" radius={"lg"} autoContrast>
        İptal Et
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
            label="İptal Nedeni"
            placeholder="Lütfen bir neden seçin"
            value={selectedReason}
            onChange={(value) => {
              setSelectedReason(value);
              setError(null); // Yeni seçim yapıldığında hata mesajını temizle
            }}
            required
            allowDeselect={false}
            checkIconPosition="right"
            classNames={{
              label: "font-bold",
            }}
          />

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="subtle" onClick={close}>
              Vazgeç
            </Button>
            <Button
              color="red"
              onClick={handleCancel}
              loading={loading}
              disabled={!selectedReason}
            >
              İptal Et
            </Button>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
};

export default CancelOrderButton;
