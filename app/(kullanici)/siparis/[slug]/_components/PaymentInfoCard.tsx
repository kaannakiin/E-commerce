import { Badge, Card, Divider, Group, Stack, Title, Text } from "@mantine/core";
import {
  BankTransferNotification,
  PaymentStatus,
  PaymentType,
  UserCancelReason,
} from "@prisma/client";
import { formatCancelReason, formatPaymentStatusWithColor } from "@/lib/format";
import { TbCreditCard, TbCalendar, TbAlertCircle } from "react-icons/tb";
import React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface PaymentInfoCardProps {
  maskedCardNumber: string;
  isCancelled: boolean;
  paymentStatus: PaymentStatus;
  paymentDate: Date | null;
  cancelProcessDate: Date | null;
  cancelReason: UserCancelReason | null;
  paymentType: PaymentType;
  bankTransferNotification: BankTransferNotification | null;
}

const PaymentInfoCard = (props: PaymentInfoCardProps) => {
  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})/g, "$1 ").trim();
  };

  return (
    <Card withBorder shadow="md" padding="lg">
      <Stack gap="xs">
        <Title order={4}>Ödeme Bilgileri</Title>
        <Divider />

        <Stack gap="md">
          {props.maskedCardNumber && (
            <Group gap="xs" align="center">
              <TbCreditCard size={20} style={{ color: "#666" }} />
              <Text size="sm" c="dimmed">
                Kart Numarası:
              </Text>
              <Text>{formatCardNumber(props.maskedCardNumber)}</Text>
            </Group>
          )}
          <Group gap="xs" align="center">
            <TbCalendar size={20} style={{ color: "#666" }} />
            <Text size="sm" c="dimmed">
              Ödeme Durumu:
            </Text>
            <Badge
              color={formatPaymentStatusWithColor(props.paymentStatus).color}
              variant="light"
            >
              {props.paymentType === "BANK_TRANSFER" &&
              props.paymentStatus === "PENDING"
                ? "Havale/EFT onayı bekleniyor"
                : formatPaymentStatusWithColor(props.paymentStatus).text}
            </Badge>
            {props.paymentDate && (
              <Text size="sm">
                {new Date(props.paymentDate).toLocaleDateString("tr-TR")}
              </Text>
            )}
          </Group>
          {props.bankTransferNotification && (
            <Group gap="xs" align="center">
              <Text size="sm" c={"dimmed"} tt="capitalize">
                Havale/EFT Bildirimi:{" "}
                {props.bankTransferNotification.name +
                  " " +
                  props.bankTransferNotification.surname}
              </Text>
              <Text size="sm" c={"dimmed"} tt="capitalize">
                Havale Zamanı: {props.bankTransferNotification.transactionTime}{" "}
              </Text>
            </Group>
          )}
          {props.isCancelled && (
            <Group gap="xs" align="center">
              <TbAlertCircle size={20} style={{ color: "red" }} />
              <Text size="sm" c="dimmed">
                İptal Bilgisi:
              </Text>
              <Text size="sm" c="red">
                {formatCancelReason(props.cancelReason).text}
              </Text>
              {props.cancelProcessDate && (
                <Text size="sm">
                  {format(
                    new Date(props.cancelProcessDate),
                    "dd MMMM yyyy EEEE",
                    {
                      locale: tr,
                    },
                  )}
                </Text>
              )}
            </Group>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default PaymentInfoCard;
