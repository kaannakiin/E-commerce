"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import { policyFormSchema, PolicyFormValues } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Divider, Select, TextInput } from "@mantine/core";
import { ECommerceAgreements } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import ControlledRichEditor from "../../../blog/_components/RichEditor";
import { FormDbDefaultValues } from "../[slug]/page";
import { PoliciesEdit } from "../_actions/PoliciesActions";
export const agreementLabels: Record<ECommerceAgreements, string> = {
  TERMS_OF_SERVICE: "Kullanım Koşulları Sözleşmesi",
  PRIVACY_POLICY: "Gizlilik Politikası",
  DISTANCE_SALES_AGREEMENT: "Mesafeli Satış Sözleşmesi",
  PERSONAL_DATA_PROTECTION:
    "Kişisel Verilerin Korunması ve İşlenmesi Politikası",
  CLARIFICATION_TEXT: "KVKK Aydınlatma Metni",
  EXPLICIT_CONSENT: "Açık Rıza Metni",
  MEMBERSHIP_AGREEMENT: "Üyelik Sözleşmesi",
  SECURE_SHOPPING: "Güvenli Alışveriş Sözleşmesi",
  RETURN_POLICY: "İade ve Değişim Politikası",
  PAYMENT_TERMS: "Ödeme Koşulları Sözleşmesi",
};
interface FormProps {
  defaultValues?: FormDbDefaultValues;
}
const PolicyForm = ({ defaultValues }: FormProps) => {
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const { refresh } = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      policyTitle: defaultValues?.title,
      policyType: defaultValues?.type,
      policyTemplate: defaultValues?.content,
    },
  });
  const onSubmit: SubmitHandler<PolicyFormValues> = async (data) => {
    try {
      await PoliciesEdit(
        data,
        defaultValues?.id ? defaultValues.id : null,
      ).then((res) => {
        if (res.success) {
          setFeedbackState({
            isOpen: true,
            message: res.message,
            type: "success",
          });
        } else {
          setFeedbackState({
            isOpen: true,
            message: res.message,
            type: "error",
          });
        }
        refresh();
      });
    } catch (error) {
      setFeedbackState({
        isOpen: true,
        message: "Bir Hata Oluştu",
        type: "error",
      });
    }
  };
  return (
    <Card
      withBorder
      shadow="xs"
      radius="md"
      className="mx-auto min-h-screen w-full p-5 lg:w-[70%] lg:p-10"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Button
          type="submit"
          className="absolute right-4 top-4"
          loading={isSubmitting}
        >
          Kaydet
        </Button>
        <Controller
          control={control}
          name="policyTitle"
          render={({ field }) => (
            <TextInput
              withAsterisk
              label="Sözleşme Başlığı"
              {...field}
              error={errors?.policyTitle?.message}
            />
          )}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Controller
            control={control}
            name="policyType"
            render={({ field }) => (
              <Select
                withAsterisk
                label="Sözleşme Türü"
                disabled={defaultValues?.type ? true : false}
                data={Object.values(ECommerceAgreements).map((value) => ({
                  value: value,
                  label: agreementLabels[value],
                }))}
                error={errors?.policyType?.message}
                {...field}
              />
            )}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <h6 className="text-xl font-semibold">Sözleşme Şablonu</h6>
          <Divider my="xs" size={"md"} />
          <ControlledRichEditor control={control} name="policyTemplate" />
          {errors?.policyTemplate && (
            <div>{errors?.policyTemplate?.message}</div>
          )}
        </div>
      </form>
      <FeedbackDialog
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState((prev) => ({ ...prev, isOpen: false }))}
        message={feedbackState.message}
        type={feedbackState.type}
      />
    </Card>
  );
};

export default PolicyForm;
