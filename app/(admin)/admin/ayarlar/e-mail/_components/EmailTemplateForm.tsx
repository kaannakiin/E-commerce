"use client";
import {
  EmailTemplateSchema,
  EmailTemplateSchemaType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Switch, Textarea, TextInput } from "@mantine/core";
import { EmailTemplateType, VariantType } from "@prisma/client";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { formValues, SalerInfoType, SeoType } from "../[slug]/page";
import PreviewTemplate from "./PreviewWithDevice";
import { getHtmlTemplate } from "../utils/CustomHtmlTemplate";
import { useMemo, useState } from "react";
import { EmailTemplateAction } from "../_actions/EmailAction";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useRouter } from "next/navigation";
interface EmailTemplateFormProps {
  slug: EmailTemplateType;
  seo: SeoType;
  salerInfo: SalerInfoType;
  formValues: formValues;
}

const EmailTemplateForm = ({
  slug,
  salerInfo,
  seo,
  formValues,
}: EmailTemplateFormProps) => {
  const defaultValueTemplate = defaultValuesForEmailTemplate(slug);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmailTemplateSchemaType>({
    resolver: zodResolver(EmailTemplateSchema),
    defaultValues: formValues
      ? {
          altText: formValues.altText,
          buttonText: formValues.buttonText,
          showButton: formValues.showButton,
          title: formValues.title,
        }
      : {
          altText: defaultValueTemplate.altText,
          buttonText: defaultValueTemplate.buttonText,
          showButton: defaultValueTemplate.showButton,
          title: defaultValueTemplate.title,
        },
  });
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const { refresh } = useRouter();
  const onSubmit: SubmitHandler<EmailTemplateSchemaType> = async (data) => {
    const res = await EmailTemplateAction(data, slug);
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
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg">
        <div className="flex-1 p-6">
          <PreviewTemplate
            htmlContent={getHtmlTemplate({
              type: slug,
              salerInfo,
              seo,
              title: watch("title"),
              altText: watch("altText"),
              buttonText: watch("buttonText"),
              showButton: watch("showButton"),
              product: defaultValueTemplate.product || null,
            })}
          />
        </div>
      </div>
      <div className="flex flex-col rounded-xl bg-white shadow-md">
        <form
          className="flex flex-col space-y-4 p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextInput
                label="Başlık"
                classNames={{ label: "font-bold" }}
                {...field}
                error={errors.title?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="altText"
            render={({ field }) => (
              <Textarea
                label="Açıklama"
                classNames={{ label: "font-bold" }}
                {...field}
                error={errors.altText?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="showButton"
            render={({ field: { value, onChange } }) => (
              <Switch
                label="Buton Göster"
                checked={value}
                onChange={(event) => onChange(event.currentTarget.checked)}
                className="w-fit"
                error={errors.showButton?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="buttonText"
            render={({ field }) => (
              <TextInput
                label="Buton Metni"
                classNames={{ label: "font-bold" }}
                {...field}
                error={errors.buttonText?.message}
              />
            )}
          />
          <Button type="submit" loading={isSubmitting}>
            Kaydet
          </Button>
        </form>
      </div>{" "}
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </div>
  );
};

export default EmailTemplateForm;

export const defaultValuesForEmailTemplate = (type: EmailTemplateType) => {
  switch (type) {
    case "ORDER_CANCELLED":
      return {
        title: "Siparişiniz iptal edildi",
        altText:
          "{{orderNumber}} numaralı siparişiniz talebiniz doğrultusunda iade edilmiştir.",
        showButton: false,
        buttonText: "Deneme",
        product: [
          {
            url: "/images/image-3.png",
            name: "Deneme",
            price: 100,
            quantity: 1,
            type: VariantType.COLOR,
            value: "#ff0000",
            description: "Deneme",
          },
          {
            url: "/images/image-3.png",
            name: "Deneme",
            price: 100,
            quantity: 1,
            type: VariantType.COLOR,
            value: "#ff0000",
            description: "Deneme",
          },
        ],
      };
    case "ORDER_CREATED":
      return {
        title: "Siparişiniz oluşturuldu",
        altText:
          "Siparişiniz başarıyla oluşturuldu, siparişinizi kargoya hazırlıyoruz. Siparişiniz kargoya verildiğinde sizi e-posta ve SMS ile bilgilendireceğiz.",
        showButton: true,
        buttonText: "Sipariş Detayları",
        product: [
          {
            url: "/images/image-3.png",
            name: "Deneme",
            price: 100,
            quantity: 1,
            type: VariantType.COLOR,
            value: "#ff0000",
            description: "Deneme",
          },
          {
            url: "/images/image-3.png",
            name: "Deneme",
            price: 100,
            quantity: 1,
            type: VariantType.COLOR,
            value: "#ff0000",
            description: "Deneme",
          },
        ],
      };
    case "ORDER_DELIVERED":
      return {
        title: "Siparişiniz Teslim Edildi",
        altText: "Siparişiniz başarıyla teslim edildi.",
        showButton: false,
        buttonText: "Deneme",
        product: [
          {
            url: "/images/image-3.png",
            name: "Deneme",
            price: 100,
            quantity: 1,
            type: VariantType.COLOR,
            value: "#ff0000",
            description: "Deneme",
          },
          {
            url: "/images/image-3.png",
            name: "Deneme",
            price: 100,
            quantity: 1,
            type: VariantType.COLOR,
            value: "#ff0000",
            description: "Deneme",
          },
        ],
      };
    case "ORDER_INVOICE":
      return {
        title: "Faturanız Hazır",
        altText:
          "Faturanız hazır, faturanızı görüntülemek için butona tıklayın.",
        showButton: true,
        buttonText: "Faturayı Görüntüle",
      };
    case "ORDER_REFUNDED":
      return {
        title: "Sipariş iade talebiniz onaylandı.",
        altText:
          "{{orderNumber}} numaralı siparişiniz için talebiniz doğrultusunda para iadesi yapılmıştır.",
        showButton: false,
        buttonText: "Deneme",
        product: [
          {
            url: "/images/image-3.png",
            name: "Deneme",
            price: 100,
            quantity: 1,
            type: VariantType.COLOR,
            value: "#ff0000",
            description: "Deneme",
          },
          {
            url: "/images/image-3.png",
            name: "Deneme",
            price: 100,
            quantity: 1,
            type: VariantType.COLOR,
            value: "#ff0000",
            description: "Deneme",
          },
        ],
      };
    case "PASSWORD_RESET":
      return {
        title: "Şifre Sıfırlama",
        altText: "Şifrenizi sıfırlamak için butona tıklayın.",
        showButton: true,
        buttonText: "Şifre Sıfırla",
      };

    case "REFUND_REJECTED":
      return {
        title: "Siparişiniz için para iadesi reddedildi",
        altText:
          "{{orderNumber}} numaralı siparişiniz için talebiniz doğrultusunda para iadesi reddedilmiştir.",
        showButton: false,
        buttonText: "Deneme",
      };
    case "REFUND_REQUESTED":
      return {
        title: "Siparişiniz için para iadesi talebiniz alındı",
        altText:
          "{{orderNumber}} numaralı siparişiniz için para iadesi talebiniz alınmıştır.",
        showButton: false,
        buttonText: "Deneme",
      };
    case "SHIPPING_CREATED":
      return {
        title: "Kargo Takip Numaranız",
        altText:
          "Siparişiniz kargoya verildi. Kargo takip numaranız: {{trackingNumber}}",
        showButton: false,
        buttonText: "Deneme",
      };
    case "SHIPPING_DELIVERED":
      return {
        title: "Siparişiniz Teslim Edildi",
        altText: "Siparişiniz başarıyla teslim edildi.",
        showButton: false,
        buttonText: "Deneme",
      };
    case "WELCOME_MESSAGE":
      return {
        title: "Hoşgeldiniz",
        altText: "{{companyName}} ailesine hoşgeldiniz.",
        showButton: false,
        buttonText: "Deneme",
      };
  }
};
