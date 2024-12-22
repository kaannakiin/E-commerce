"use client";
import { Button, Modal, Select, Stack, Text } from "@mantine/core";
import React, { Fragment, useState } from "react";
import { CancelButtonProps } from "../[slug]/page";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { CancelReason } from "@prisma/client";
import { useRouter } from "next/navigation";

const customerCancelReasons = {
  [CancelReason.CUSTOMER_REQUEST]:
    "Vazgeçtim, siparişimi iptal etmek istiyorum",
  [CancelReason.DUPLICATE_ORDER]: "Yanlışlıkla birden fazla sipariş verdim",
  [CancelReason.OTHER]: "Diğer nedenler",
};

const CancelButton = ({ props }: { props: CancelButtonProps }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<CancelReason | null>(
    null,
  );
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { refresh } = useRouter();
  const handleCancel = async () => {
    if (!selectedReason) return;
    setIsLoading(true);
    try {
      await fetchWrapper
        .post("/user/payment/order/cancel-order", {
          paymentId: props.paymentId,
          cancelReason: selectedReason,
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
            setSuccessMessage("Siparişiniz başarıyla iptal edildi");
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

  const selectData = Object.entries(customerCancelReasons).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  return (
    <Fragment>
      <Button
        variant="light"
        color="red"
        size="sm"
        onClick={() => setModalOpen(true)}
      >
        İptal Et
      </Button>

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedReason(null);
        }}
        title="Sipariş İptal"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm">Lütfen sipariş iptal nedeninizi seçiniz:</Text>
          <Select
            data={selectData}
            value={selectedReason}
            onChange={(value) => setSelectedReason(value as CancelReason)}
            placeholder="İptal nedeni seçiniz"
            searchable
            clearable
            required
          />
          {errorDetails && <Text color="red">{errorDetails}</Text>}
          {successMessage && <Text color="green">{successMessage}</Text>}
          <Button
            onClick={handleCancel}
            loading={isLoading}
            disabled={!selectedReason}
            color="red"
            fullWidth
          >
            Siparişi İptal Et
          </Button>
        </Stack>
      </Modal>
    </Fragment>
  );
};

export default CancelButton;
