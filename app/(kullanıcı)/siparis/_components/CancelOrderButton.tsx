"use client";
import { Button, Modal, Select, Textarea, Tooltip } from "@mantine/core";
import { FaArrowRotateLeft } from "react-icons/fa6";
import React, { Fragment } from "react";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { useDisclosure } from "@mantine/hooks";
import { CustomModal } from "@/components/CustomModal";
import { SubmitHandler, useForm } from "react-hook-form";
import { refundFormSchema, RefundFormValues } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { OrderStatus, paymentStatus } from "@prisma/client";
const CANCELLATION_REASONS = [
  { value: "wrong_product", label: "Yanlış ürün seçimi" },
  { value: "better_price", label: "Daha uygun fiyat buldum" },
  { value: "delivery_time", label: "Teslimat süresi uzun" },
  { value: "changed_mind", label: "Fikrim değişti" },
  { value: "financial", label: "Finansal nedenler" },
  { value: "other", label: "Diğer" },
];
const CancelOrderButton = ({
  paymentId,
  ip,
  orderStatus,
  paymentStatus,
  createdAt,
}: {
  paymentId: string;
  ip: string;
  orderStatus: OrderStatus;
  paymentStatus: paymentStatus;
  createdAt: Date;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema),
  });
  const router = useRouter();
  const orderDate = new Date(createdAt);
  const now = new Date();
  const isSameDay =
    orderDate.toISOString().split("T")[0] === now.toISOString().split("T")[0];
  const handleRefund: SubmitHandler<RefundFormValues> = async (data) => {
    try {
      if (isSameDay) {
        const request = await fetchWrapper.post("/user/payment/refund-order", {
          paymentId,
          ip,
          reason: data.info,
        });
        if (request.status === 200) {
          close();
          router.refresh();
          reset();
        } else {
          setError("root", {
            message:
              "İptal işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
          });
        }
      }

      return null;
    } catch (error) {}
  };
  if (
    isSameDay &&
    orderStatus !== "CANCELLED" &&
    paymentStatus !== "REFUNDED" &&
    paymentStatus === "SUCCESS"
  ) {
    return (
      <Fragment>
        <Button
          leftSection={<FaArrowRotateLeft size={18} />}
          variant="outline"
          color="red"
          radius="md"
          size="sm"
          className="transition-colors duration-200 hover:bg-red-50"
          onClick={open}
        >
          İptal Et
        </Button>
        <CustomModal
          title="Siparişi İptal Et"
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
          isOpen={opened}
          onClose={close}
        >
          <form onSubmit={handleSubmit(handleRefund)} className="space-y-6">
            <Select
              label="İptal Nedeni"
              placeholder="Seçiniz"
              {...register("info")}
              onChange={(value) => setValue("info", value as string)}
              data={CANCELLATION_REASONS}
            />

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" color="gray" onClick={close}>
                İptal
              </Button>

              <Button type="submit" loading={isSubmitting} color="blue">
                {isSubmitting ? "İptal Ediliyor..." : "İptal Et"}
              </Button>
            </div>
          </form>
        </CustomModal>
      </Fragment>
    );
  }
};

export default CancelOrderButton;
