"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import {
  EmailTemplateSchema,
  EmailTemplateSchemaType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  ColorInput,
  rem,
  Textarea,
  TextInput,
  DEFAULT_THEME,
} from "@mantine/core";
import { render } from "@react-email/render";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { GiEyedropper } from "react-icons/gi";
import { formValues, SalerInfoType, SeoType } from "../[slug]/page";
import { EmailTemplateTypeForUI } from "../types/type";
import { defaultValuesForEmailTemplate } from "../utils/EmailDefaultValues";
import { EmailLayout } from "./HtmlTemplate";
import PreviewTemplate from "./PreviewWithDevice";
import { EmailTemplateAction } from "../_actions/EmailAction";
interface EmailTemplateFormProps {
  slug: EmailTemplateTypeForUI;
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
  const showButtonControls =
    slug === EmailTemplateTypeForUI.PASSWORD_RESET ||
    slug === EmailTemplateTypeForUI.WELCOME_MESSAGE;
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmailTemplateSchemaType>({
    resolver: zodResolver(EmailTemplateSchema),
    defaultValues: {
      title: formValues?.title || defaultValueTemplate.title,
      altText: formValues?.altText || defaultValueTemplate.altText,
      buttonColor: formValues?.buttonColor || "#000000",
      buttonText: formValues?.buttonText || "Buton Metni",
    },
  });
  const themeColors = [
    "#2e2e2e",
    "#868e96",
    "#fa5252",
    "#e64980",
    "#be4bdb",
    "#7950f2",
    "#4c6ef5",
    "#228be6",
    "#15aabf",
    "#12b886",
    "#40c057",
    "#82c91e",
    "#fab005",
    "#fd7e14",
  ];
  const [html, setHtml] = useState<string>("");
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
  const watchedTitle = watch("title");
  const watchedAltText = watch("altText");
  const watchedButtonColor = watch("buttonColor");
  const watchedButtonText = watch("buttonText");
  const templateProps = useMemo(
    () => ({
      title: watchedTitle || defaultValueTemplate.title,
      altText: watchedAltText || defaultValueTemplate.altText,
      salerInfo,
      products: defaultValueTemplate.product,
      button: showButtonControls
        ? {
            text: watchedButtonText || "Buton Metni",
            color: watchedButtonColor || "#000000",
            link: "#",
          }
        : undefined,
    }),
    [
      watchedTitle,
      watchedAltText,
      watchedButtonText,
      watchedButtonColor,
      defaultValueTemplate,
      salerInfo,
      showButtonControls,
    ],
  );
  const renderTemplate = useCallback(async () => {
    try {
      const renderedHtml = await render(<EmailLayout {...templateProps} />, {
        pretty: true,
      });
      setHtml(renderedHtml);
    } catch (error) {
      console.error("Error rendering email template:", error);
    }
  }, [templateProps]);

  useEffect(() => {
    renderTemplate();
  }, [renderTemplate]);

  // Update form values when slug changes
  useEffect(() => {
    const newDefaults = defaultValuesForEmailTemplate(slug);
    setValue("title", newDefaults.title);
    setValue("altText", newDefaults.altText);
    if (showButtonControls) {
      setValue("buttonColor", newDefaults.button?.color || "#000000");
      setValue("buttonText", newDefaults.button?.text || "Buton Metni");
    }
  }, [slug, setValue, showButtonControls]);

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
          <PreviewTemplate htmlContent={html} />
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
                description="orderNumber başına eklenecektir."
                classNames={{ label: "font-bold" }}
                {...field}
                error={errors.altText?.message}
              />
            )}
          />
          {showButtonControls && (
            <Fragment>
              <Controller
                control={control}
                name="buttonColor"
                render={({ field }) => (
                  <ColorInput
                    format="hex"
                    value={field.value}
                    label="Buton Rengi"
                    onChange={field.onChange}
                    swatches={[
                      ...DEFAULT_THEME.colors.red,
                      ...DEFAULT_THEME.colors.green,
                      ...DEFAULT_THEME.colors.blue,
                      ...DEFAULT_THEME.colors.yellow,
                    ]}
                    withPicker={false}
                    eyeDropperIcon={
                      <GiEyedropper
                        style={{ width: rem(18), height: rem(18) }}
                        fontWeight={500}
                      />
                    }
                    className="w-full"
                    size="sm"
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
            </Fragment>
          )}
          <Button type="submit" loading={isSubmitting}>
            Kaydet
          </Button>
        </form>
      </div>
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
