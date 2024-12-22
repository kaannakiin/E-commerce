"use client";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { IdForEverythingType } from "@/zodschemas/authschema";
import { Button, Modal, Select, Stack, Text } from "@mantine/core";
import { CancelReason } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

const refundReasons = {
  [CancelReason.CUSTOMER_REQUEST]:
    "Vazgeçtim, siparişimi iptal etmek istiyorum",
  [CancelReason.DUPLICATE_ORDER]: "Yanlışlıkla birden fazla sipariş verdim",
  [CancelReason.OTHER]: "Diğer nedenler",
};

const RefundButton = ({
  orderItemsId,
}: {
  orderItemsId: IdForEverythingType;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<CancelReason | null>(
    null,
  );
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { refresh } = useRouter();

  const handleRefund = async () => {
    if (!selectedReason) return;
    setIsLoading(true);
    try {
      await fetchWrapper
        .post("/user/payment/order/refund-order/refund-request", {
          refundReason: selectedReason,
          orderItemsId,
        })
        .then((res) => {
          if (res.status === 400) {
            setErrorDetails(res.error);
            setTimeout(() => {
              setModalOpen(false);
              setSelectedReason(null);
              setErrorDetails(null);
            }, 2000);
          }
          if (res.status === 200) {
            setSuccessMessage("İade talebiniz başarıyla oluşturuldu");
            setTimeout(() => {
              setModalOpen(false);
              setSelectedReason(null);
              setSuccessMessage(null);
            }, 2000);
          }
          refresh();
        });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectData = Object.entries(refundReasons).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Fragment>
      <Button
        variant="outline"
        color="red"
        size="xs"
        onClick={() => setModalOpen(true)}
      >
        İade Et
      </Button>
      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedReason(null);
        }}
        title="Ürün İade"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm">Lütfen ürün iade nedeninizi seçiniz:</Text>
          <Select
            data={selectData}
            value={selectedReason}
            onChange={(value) => setSelectedReason(value as CancelReason)}
            placeholder="İade nedeni seçiniz"
            searchable
            clearable
            required
          />
          {errorDetails && <Text color="red">{errorDetails}</Text>}
          {successMessage && <Text color="green">{successMessage}</Text>}
          <Button
            onClick={handleRefund}
            loading={isLoading}
            disabled={!selectedReason}
            color="blue"
            fullWidth
          >
            İade Talebini Oluştur
          </Button>
        </Stack>
      </Modal>
    </Fragment>
  );
};

export default RefundButton;
