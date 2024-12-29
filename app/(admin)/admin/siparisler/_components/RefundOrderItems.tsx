"use client";
import CustomImage from "@/components/CustomImage";
import { formatCancelReason, formattedPrice } from "@/lib/format";
import {
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Fragment, useState } from "react";
import { MdClose, MdDone, MdVisibility } from "react-icons/md";
import { OrderRefundType } from "../[slug]/page";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { useRouter } from "next/navigation";
import { UserCancelReason } from "@prisma/client";

const RefundRequestModal = ({
  item,
  paymentId,
}: {
  item: OrderRefundType;
  paymentId: string;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [rejectReason, setRejectReason] = useState("");
  const { refresh } = useRouter();
  const onApproved = async () => {
    await fetchWrapper
      .post("/user/payment/order/refund-order", {
        paymentId,
        refundReason: item.refundReason,
        orderItemsId: item.id,
      })
      .then((res) => {
        if (res.status === 200) {
          close();
          refresh();
        }
      });
  };
  const onRejected = async () => {};
  return (
    <Fragment>
      <Button
        variant="light"
        color="red"
        size="sm"
        onClick={open}
        fullWidth
        className="md:w-auto"
        leftSection={<MdVisibility size={16} />}
      >
        İade Talebini Görüntüle
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        centered
        title="İade Talebi Detayları"
        size="md"
        overlayProps={{
          blur: 3,
        }}
      >
        <Stack gap="lg">
          {/* Ürün Bilgileri */}
          <Group wrap="nowrap" align="flex-start">
            <div className="relative h-24 w-24 flex-shrink-0">
              {item.variant.Image && (
                <CustomImage
                  src={item.variant.Image[0].url}
                  objectFit="contain"
                  alt="Product Image"
                />
              )}
            </div>
            <div>
              <Text fw={500} size="lg">
                {item.variant.product.name}
              </Text>
              <Text size="sm" c="dimmed">
                Adet: {item.quantity}
              </Text>
              <Text size="sm" c="dimmed">
                Tutar: {formattedPrice(item.price)}
              </Text>
            </div>
          </Group>

          <Divider />

          {/* İade Bilgileri */}
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Text fw={500}>İade Nedeni:</Text>
              <Text>
                {formatCancelReason(item.refundReason as UserCancelReason).text}
              </Text>
            </Group>
            <Group justify="space-between" align="center">
              <Text fw={500}>Talep Tarihi:</Text>
              <Text>
                {format(new Date(item.refundRequestDate), "d MMMM yyyy hh:mm", {
                  locale: tr,
                })}
              </Text>
            </Group>
            <Group justify="space-between" align="center">
              <Text fw={500}>Durum:</Text>
              <Badge
                color={
                  item.refundStatus === "COMPLETED"
                    ? "green"
                    : item.refundStatus === "REJECTED"
                      ? "red"
                      : "blue"
                }
              >
                {item.refundStatus === "PROCESSING"
                  ? "İşlemde"
                  : item.refundStatus === "COMPLETED"
                    ? "Tamamlandı"
                    : item.refundStatus === "REJECTED"
                      ? "Reddedildi"
                      : "Beklemede"}
              </Badge>
            </Group>
          </Stack>

          {item.refundStatus === "PROCESSING" && (
            <Fragment>
              <Divider />
              <Stack gap="md">
                <Text fw={500}>İade Talebi Değerlendirmesi</Text>

                <Textarea
                  placeholder="Red sebebi (Opsiyonel)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.currentTarget.value)}
                  minRows={3}
                />

                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="outline"
                    color="red"
                    onClick={onRejected}
                    disabled={
                      rejectReason.length < 10 && rejectReason.length !== 0
                    }
                    leftSection={<MdClose size={16} />}
                  >
                    Reddet
                  </Button>
                  <Button
                    onClick={onApproved}
                    color="green"
                    leftSection={<MdDone size={16} />}
                  >
                    Onayla
                  </Button>
                </Group>
              </Stack>
            </Fragment>
          )}
        </Stack>
      </Modal>
    </Fragment>
  );
};

export default RefundRequestModal;
