"use client";
import { CustomModal } from "@/components/CustomModal";
import { refundFormSchema, RefundFormValues } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, NumberInput, Select, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { OrderStatus, paymentStatus } from "@prisma/client";
import { differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { HiMiniReceiptRefund } from "react-icons/hi2";
import { OrderReturn } from "../_actions/OrderAction";
const ReturnOrderButton = ({
  orderStatus,
  deliveredDate,
  createdAt,
  orderId,
  paymentStatus,
}: {
  orderStatus: OrderStatus;
  deliveredDate: Date;
  createdAt: Date;
  orderId: string;
  paymentStatus: paymentStatus;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema),
  });
  const RETURN_REASONS = [
    { value: "defective_product", label: "Ürün kusurlu/arızalı geldi" },
    { value: "size_issue", label: "Beden/ölçü uygun değil" },
    { value: "different_product", label: "Gelen ürün fotoğraftakinden farklı" },
    { value: "quality_issue", label: "Kalite beklentilerimi karşılamadı" },
    { value: "damaged_shipping", label: "Ürün kargo sırasında hasar gördü" },
    { value: "missing_parts", label: "Eksik parça/aksesuar" },
    { value: "color_different", label: "Renk görseldekinden farklı" },
    { value: "wrong_product", label: "Yanlış ürün gönderildi" },
    { value: "not_satisfied", label: "Üründen memnun kalmadım" },
    { value: "other", label: "Diğer" },
  ];
  const router = useRouter();
  const handleRefund: SubmitHandler<RefundFormValues> = async (data) => {
    await OrderReturn({
      info: data.info as string,
      orderId,
      description: data.description,
    }).then((res) => {
      reset({
        description: "",
        info: "",
      });
      if (!res.status) {
        setError("root", {
          message: res.message,
        });
      }
      if (res.status) {
        reset();
        close();
        router.refresh();
      }
    });
  };
  const deliveredItemsDate = new Date(deliveredDate);
  const orderCreatedDate = new Date(createdAt);
  const now = new Date();
  const isSameDay =
    orderCreatedDate.toISOString().split("T")[0] ===
    now.toISOString().split("T")[0];
  const isWithinFourteenDays = differenceInDays(now, deliveredItemsDate) <= 14;

  if (
    orderStatus === "DELIVERED" &&
    isWithinFourteenDays &&
    !isSameDay &&
    paymentStatus === "SUCCESS"
  ) {
    return (
      <Fragment>
        <Button
          leftSection={<HiMiniReceiptRefund size={18} />}
          variant="outline"
          color="red"
          radius="md"
          size="sm"
          className="transition-colors duration-200 hover:bg-red-50"
          onClick={open}
        >
          İade Talebi Başlat
        </Button>
        <CustomModal
          title="Siparişi İade Talebi Oluştur"
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
          isOpen={opened}
          onClose={close}
          className="mx-auto w-full max-w-md rounded-lg bg-white"
        >
          <form onSubmit={handleSubmit(handleRefund)} className="space-y-6">
            <Select
              label="İade Nedeni"
              placeholder="Seçiniz"
              variant="filled"
              error={errors.info?.message}
              {...register("info")}
              onChange={(value) =>
                setValue(
                  "info",
                  RETURN_REASONS.find((reason) => reason.value === value)
                    ?.label,
                )
              }
              data={RETURN_REASONS}
            />
            <Textarea
              {...register("description")}
              variant="filled"
              error={errors.description?.message}
              label="Açıklama"
              placeholder="Lütfen bir açıklama giriniz"
              maxRows={3}
            />

            {errors.root && (
              <p className="text-red-500">{errors.root.message}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" color="gray" onClick={close}>
                İptal
              </Button>

              <Button type="submit" loading={isSubmitting} color="blue">
                {isSubmitting ? "İade Ediliyor..." : "İade Talebi Oluştur"}
              </Button>
            </div>
          </form>
        </CustomModal>
      </Fragment>
    );
  }
};
//TODO BURADA ÜRÜN ÜRÜN İADE YAPILACAK
export default ReturnOrderButton;
