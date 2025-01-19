"use client";
import { Button, Group, Modal, Text, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { Fragment, useState } from "react";
import { OrderConfirmAction } from "../_actions/OrderConfirmAction";
import MainLoader from "@/components/MainLoader";

interface OrderConfirmCheckProps {
  orderNumber: string;
}

const OrderConfirmCheck = ({ orderNumber }: OrderConfirmCheckProps) => {
  const [opened, { open, close }] = useDisclosure();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    try {
      setLoading(true);
      await OrderConfirmAction(orderNumber).then((res) => {
        if (res.success) {
          close();
        } else {
          setMessage(res.message);
        }
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <MainLoader opacity={0.5} />;
  return (
    <Fragment>
      <Button size="sm" onClick={open}>
        Siparişi Onayla
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        centered
        title="Sipariş Onaylama"
        classNames={{ title: "text-xl font-bold" }}
      >
        <Stack gap="md">
          <Text fw={500} size="lg">
            Sipariş No: {orderNumber}
          </Text>

          <Text>
            Bu siparişi onayladığınızda aşağıdaki işlemler gerçekleşecektir:
          </Text>

          <Text size="sm" c="dimmed">
            • Müşteriye siparişinin onaylandığına dair bilgilendirme e-postası
            gönderilecek
            <br />
            • Sipariş durumu &quot;Onaylandı&quot; olarak güncellenecek
            <br />• Stok miktarları otomatik olarak güncellenecek
          </Text>

          <Text c="red" size="sm">
            Bu işlem geri alınamaz. Lütfen tüm sipariş detaylarını kontrol
            ettiğinizden emin olun.
          </Text>
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="red" onClick={close}>
            İptal
          </Button>
          <Button onClick={onClick}>Siparişi Onayla</Button>
        </Group>
      </Modal>
    </Fragment>
  );
};

export default OrderConfirmCheck;
