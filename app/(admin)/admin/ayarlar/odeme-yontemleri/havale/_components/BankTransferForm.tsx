"use client";
import ControlledRichEditor from "@/app/(admin)/admin/blog/_components/RichEditor";
import {
  paymentMethodsForm,
  PaymentMethodsFormValues,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Grid,
  NumberInput,
  Select,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { MdOutlineInfo } from "react-icons/md";
import { BankTransferAction } from "../_actions/BankTransferForm";
import { DiscountType, OrderChangeType, PaymentChannels } from "@prisma/client";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BankTransferFormProps } from "../page";

const BankTransferForm = ({ data }: { data: BankTransferFormProps | null }) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<PaymentMethodsFormValues>({
    resolver: zodResolver(paymentMethodsForm),
    defaultValues: {
      type: PaymentChannels.transfer,
      title: data?.title || "Havale / EFT",
      description: data?.description,
      minAmount: data?.minAmount,
      maxAmount: data?.maxAmount,
      orderChangeType: data?.orderChangeType || "minus",
      orderChange: data?.orderChange,
      orderChangeDiscountType: data?.orderChangeDiscountType || "FIXED",
    },
  });
  const { push, refresh } = useRouter();
  const onSubmit: SubmitHandler<PaymentMethodsFormValues> = async (data) => {
    try {
      await BankTransferAction(data).then((res) => {
        if (res.success) {
          setDialogState((prev) => ({
            ...prev,
            isOpen: true,
            message: res.message,
            type: "success",
          }));
          push("/admin/ayarlar/odeme-yontemleri");
        } else {
          setDialogState((prev) => ({
            ...prev,
            isOpen: true,
            message: res.message,
            type: "error",
          }));
          refresh();
        }
      });
    } catch (error) {
      setDialogState((prev) => ({
        ...prev,
        isOpen: true,
        message: "Bir hata oluştu",
        type: "error",
      }));
      refresh();
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center justify-end">
        <Button type="submit" loading={isSubmitting}>
          Kaydet
        </Button>
      </div>
      <Controller
        control={control}
        name="type"
        render={({ field }) => <select hidden />}
      />
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <TextInput
            {...field}
            label="Ödeme Yöntemi Adı"
            rightSection={
              <Tooltip
                color="primary.9"
                label="Buradaki ad, satın alma aşamasında müşteri tarafından görünecektir."
              >
                <MdOutlineInfo />
              </Tooltip>
            }
          />
        )}
      />
      <Grid>
        <Grid.Col span={6}>
          <Controller
            control={control}
            name="minAmount"
            render={({ field }) => (
              <NumberInput
                {...field}
                label="Minimum sepet tutarı"
                min={0}
                hideControls
                error={errors.minAmount?.message}
                max={Number.MAX_SAFE_INTEGER}
                rightSection={
                  <Tooltip
                    color="primary.9"
                    label="Sepet tutarı buraya girdiğiniz değerin altında olan müşteri bu ödeme yöntemini görmez"
                  >
                    <MdOutlineInfo />
                  </Tooltip>
                }
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Controller
            control={control}
            name="maxAmount"
            render={({ field }) => (
              <NumberInput
                {...field}
                hideControls
                error={errors.maxAmount?.message}
                label="Maksimum sepet tutarı"
                rightSection={
                  <Tooltip
                    color="primary.9"
                    label="Sepet tutarı buraya girdiğiniz değerin üstünde olan müşteri bu ödeme yöntemini görmez"
                  >
                    <MdOutlineInfo />
                  </Tooltip>
                }
              />
            )}
          />
        </Grid.Col>
      </Grid>
      <Grid justify="flex-start" align="flex-end">
        <Grid.Col span={6}>
          <Controller
            control={control}
            name="orderChangeType"
            render={({ field }) => (
              <Select
                {...field}
                error={errors.orderChangeType?.message}
                description="Sipariş tutarına indirim ya da arttırım yapabilirsiniz."
                classNames={{
                  label: "flex flex-row items-center justify-start gap-1",
                }}
                label="Sipariş Tutarı Değişimi"
                data={[
                  {
                    label: "Sipariş Tutarından Çıkar",
                    value: OrderChangeType.minus,
                  },
                  {
                    label: "Sipariş Tutarına Ekle",
                    value: OrderChangeType.plus,
                  },
                ]}
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={6} className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="orderChangeDiscountType"
            render={({ field }) => (
              <Select
                {...field}
                error={errors.orderChangeDiscountType?.message}
                label="Değişim Tipi"
                data={[
                  {
                    label: "%",
                    value: DiscountType.PERCENTAGE,
                  },
                  {
                    label: "₺",
                    value: DiscountType.FIXED,
                  },
                ]}
              />
            )}
          />
          <Controller
            control={control}
            name="orderChange"
            render={({ field }) => (
              <NumberInput
                {...field}
                error={errors.orderChange?.message}
                label="Değişim Miktarı"
                hideControls
                min={0}
                max={Number.MAX_SAFE_INTEGER}
              />
            )}
          />
        </Grid.Col>
      </Grid>
      <div className="space-y-1">
        <span className="flex flex-row items-center gap-1">
          Açıklama
          <Tooltip
            color="primary.9"
            label="Buradaki açıklama, satın alma sayfasında ödeme yöntemi seçilince gözükür."
          >
            <MdOutlineInfo size={16} className="text-gray-500" />
          </Tooltip>
        </span>
        <ControlledRichEditor control={control} name="description" />
      </div>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </form>
  );
};

export default BankTransferForm;
