"use client";
import {
  Button,
  Group,
  List,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import React, { Fragment, useState } from "react";
import { BankTransferConfirmAction } from "../_actions/OrderConfirm";
import FeedbackDialog from "@/components/FeedbackDialog";
import { CiCircleCheck } from "react-icons/ci";
import { BankTransferNotificationType } from "../[slug]/page";
import { formattedPrice } from "@/lib/format";
import { useRouter } from "next/navigation";

const BankTransferConfirmButton = ({
  bankTransferNotification,
  orderTotal,
}: {
  bankTransferNotification: BankTransferNotificationType;
  orderTotal: number;
}) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refresh } = useRouter();
  const handleClick = async () => {
    try {
      setLoading(true);
      await BankTransferConfirmAction(
        bankTransferNotification.orderNumber,
      ).then((res) => {
        if (res.success) {
          setDialogState((prev) => ({
            ...prev,
            isOpen: true,
            message: res.message,
            type: "success",
          }));
        } else {
          setDialogState((prev) => ({
            ...prev,
            isOpen: true,
            message: res.message,
            type: "error",
          }));
        }
        refresh();
      });
    } catch (error) {
    } finally {
      setLoading(false);
      setOpen(false);
    }   
  };
  return (
    <Fragment>
      <Button
        variant="filled"
        radius={"lg"}
        onClick={() => setOpen((prev) => !prev)}
      >
        Havale Onayla
      </Button>
      <Modal
        opened={open}
        onClose={() => setOpen((prev) => !prev)}
        withCloseButton
        title="Havale ve Sipariş Onayla"
        size={"lg"}
        centered
        classNames={{
          title: "font-bold text-xl",
        }}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 4,
        }}
      >
        <Paper
          p="xl"
          radius="md"
          style={{
            backgroundColor: "#EDF2FF",
            border: "1px solid #4C6EF5",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Text size="xl" fw={700} c="#1C1C1C" mb={16}>
            Önemli Bilgilendirme
          </Text>
          <Text size="md" fw={500} c="#2C2C2C" mb={20} lh={1.6}>
            Siparişinizi onaylamadan önce tüm detayları tekrar gözden
            geçirmenizi rica ederiz. Onayınız sonrasında:
          </Text>
          <Text size="md" fw={500} c="#2C2C2C" mb={20} lh={1.6}>
            Siparişinizi onaylamadan önce tüm detayları tekrar gözden
            geçirmenizi rica ederiz. Aşağıdaki bilgiler kullanıcın form üzerinde
            size ilettiği bilgiler. Onayınız sonrasında:
          </Text>

          <Stack gap={"1px"} my="md">
            <Group>
              <Text fw={600} c="#4C6EF5" size="sm">
                Ad:
              </Text>
              <Text fw={700} c="#2C2C2C" size="sm">
                {bankTransferNotification.name}
              </Text>
            </Group>
            <Group>
              <Text fw={600} c="#4C6EF5" size="sm">
                Soyad:
              </Text>
              <Text fw={700} c="#2C2C2C" size="sm">
                {bankTransferNotification.surname}
              </Text>
            </Group>
            <Group>
              <Text fw={600} c="#4C6EF5" size="sm">
                İşlem Tarihi:
              </Text>
              <Text fw={700} c="#2C2C2C" size="sm">
                {bankTransferNotification.transactionTime}
              </Text>
            </Group>
            <Group>
              <Text fw={600} c="#4C6EF5" size="sm">
                Ödenmesi Gereken Tutar:
              </Text>
              <Text fw={700} c="#2C2C2C" size="sm">
                {formattedPrice(orderTotal)}
              </Text>
            </Group>
          </Stack>
          <List
            spacing="md"
            size="md"
            center
            icon={
              <ThemeIcon
                color="blue"
                size={28}
                radius="xl"
                variant="filled"
                style={{ backgroundColor: "#4C6EF5" }}
              >
                <CiCircleCheck size={18} />
              </ThemeIcon>
            }
            styles={{
              item: {
                fontSize: "15px",
                fontWeight: 500,
                color: "#2C2C2C",
                lineHeight: 1.5,
              },
            }}
          >
            <List.Item>
              Müşteriye havale işleminin onaylandığı bildirilecek
            </List.Item>
            <List.Item>
              Sipariş işleme alınacak ve hazırlanmaya başlanacak
            </List.Item>
          </List>
          <Group justify="flex-end" mt={30} gap="md">
            <Button
              variant="outline"
              color="red"
              size="md"
              radius="md"
              onClick={() => setOpen((prev) => !prev)}
            >
              İptal Et
            </Button>
            <Button
              size="md"
              radius="md"
              color="blue"
              onClick={handleClick}
              loading={loading}
            >
              Onayla
            </Button>
          </Group>
        </Paper>
      </Modal>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </Fragment>
  );
};

export default BankTransferConfirmButton;
