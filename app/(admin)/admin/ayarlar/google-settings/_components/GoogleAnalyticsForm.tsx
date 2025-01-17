"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import {
  googleAnalyticsSchema,
  GoogleAnalyticsSettings,
  googleTagManagerSchema,
  GoogleTagManagerSettings,
  metaPixelSchema,
  MetaPixelSettings,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack, Switch, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  GoogleAnalyticsAction,
  GoogleTagAction,
  MetaPixelAction,
} from "../_actions/AdvertActions";
import { GoogleSettingsPageType } from "../page";

interface GoogleAnalyticsFormProps {
  type: "googleTag" | "googleAnalytics" | "metaPixel";
  data: GoogleSettingsPageType | null;
}

const GoogleAnalyticsForm = ({ type, data }: GoogleAnalyticsFormProps) => {
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
    control: googleAnalyticsControl,
    handleSubmit: submitGoogleAnalytics,
    formState: {
      errors: googleAnalyticsErrors,
      isSubmitting: isSubmittingGoogleAnalytics,
    },
  } = useForm<GoogleAnalyticsSettings>({
    resolver: zodResolver(googleAnalyticsSchema),
    defaultValues: {
      isEnabled: data?.googleAnalyticsIsEnabled || false,
      measurementId: data?.googleAnalytics || "",
    },
  });

  const {
    control: tagManagerControl,
    handleSubmit: submitTagManager,
    formState: {
      errors: tagManagerErrors,
      isSubmitting: isSubmittingTagManager,
    },
  } = useForm<GoogleTagManagerSettings>({
    resolver: zodResolver(googleTagManagerSchema),
    defaultValues: {
      isEnabled: data?.googleTagManagerIsEnabled || false,
      containerId: data?.googleTagManager || "",
    },
  });

  const {
    control: metaPixelControl,
    handleSubmit: submitMetaPixel,
    formState: { errors: metaPixelErrors, isSubmitting: isSubmittingMetaPixel },
  } = useForm<MetaPixelSettings>({
    resolver: zodResolver(metaPixelSchema),
    defaultValues: {
      isEnabled: data?.metaPixelIsEnabled || false,
      pixelId: data?.metaPixel || "",
    },
  });
  const { refresh } = useRouter();
  const onSubmitGoogleAnalytics: SubmitHandler<
    GoogleAnalyticsSettings
  > = async (data: GoogleAnalyticsSettings) => {
    try {
      await GoogleAnalyticsAction(data).then((res) => {
        if (res.success) {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "success",
          });
        } else {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "error",
          });
        }
        refresh();
      });
    } catch (error) {
      setDialogState({
        isOpen: true,
        message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        type: "error",
      });
    }
  };

  const onSubmitTagManager: SubmitHandler<GoogleTagManagerSettings> = async (
    data: GoogleTagManagerSettings,
  ) => {
    try {
      await GoogleTagAction(data).then((res) => {
        if (res.success) {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "success",
          });
        } else {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "error",
          });
        }
        refresh();
      });
    } catch (error) {
      setDialogState({
        isOpen: true,
        message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        type: "error",
      });
    }
  };

  const onSubmitMetaPixel: SubmitHandler<MetaPixelSettings> = async (
    data: MetaPixelSettings,
  ) => {
    try {
      await MetaPixelAction(data).then((res) => {
        if (res.success) {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "success",
          });
        } else {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "error",
          });
        }
        refresh();
      });
    } catch (error) {
      setDialogState({
        isOpen: true,
        message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        type: "error",
      });
    }
  };

  const renderForm = () => {
    switch (type) {
      case "googleAnalytics":
        return (
          <form
            onSubmit={submitGoogleAnalytics(onSubmitGoogleAnalytics)}
            className="flex flex-col gap-2"
          >
            <Stack>
              <Controller
                control={googleAnalyticsControl}
                name="isEnabled"
                render={({ field: { value, onChange, ...field } }) => (
                  <Switch
                    {...field}
                    checked={value}
                    onChange={(event) => onChange(event.currentTarget.checked)}
                    label="İzlemeyi etkinleştir"
                    description="Bu hizmet için izlemeyi açın/kapatın"
                  />
                )}
              />

              <Controller
                control={googleAnalyticsControl}
                name="measurementId"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    label="Ölçüm ID"
                    placeholder="G-XXXXXXXXXX formatında giriniz"
                    description="Google Analytics 4 ölçüm kimlik numaranız"
                    error={googleAnalyticsErrors.measurementId?.message}
                  />
                )}
              />
            </Stack>
            <Button
              variant="outline"
              color="blue"
              fullWidth
              mt="auto"
              type="submit"
              loading={isSubmittingGoogleAnalytics}
            >
              Ayarları Kaydet
            </Button>
          </form>
        );

      case "googleTag":
        return (
          <form
            onSubmit={submitTagManager(onSubmitTagManager)}
            className="flex flex-col gap-2"
          >
            <Stack>
              <Controller
                control={tagManagerControl}
                name="isEnabled"
                render={({ field: { value, onChange, ...field } }) => (
                  <Switch
                    {...field}
                    checked={value}
                    onChange={(event) => onChange(event.currentTarget.checked)}
                    label="İzlemeyi etkinleştir"
                    description="Bu hizmet için izlemeyi açın/kapatın"
                  />
                )}
              />
              <Controller
                control={tagManagerControl}
                name="containerId"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    label="Container ID"
                    placeholder="GTM-XXXXXXX formatında giriniz"
                    description="Tag Manager konteyner kimlik numaranız"
                    error={tagManagerErrors.containerId?.message}
                  />
                )}
              />
            </Stack>
            <Button
              variant="outline"
              color="blue"
              fullWidth
              mt="auto"
              type="submit"
              loading={isSubmittingTagManager}
            >
              Ayarları Kaydet
            </Button>
          </form>
        );

      case "metaPixel":
        return (
          <form
            onSubmit={submitMetaPixel(onSubmitMetaPixel)}
            className="flex flex-col gap-2"
          >
            <Stack>
              <Controller
                control={metaPixelControl}
                name="isEnabled"
                render={({ field: { value, onChange, ...field } }) => (
                  <Switch
                    {...field}
                    checked={value}
                    onChange={(event) => onChange(event.currentTarget.checked)}
                    label="İzlemeyi etkinleştir"
                    description="Bu hizmet için izlemeyi açın/kapatın"
                  />
                )}
              />
              <Controller
                control={metaPixelControl}
                name="pixelId"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    label="Pixel ID"
                    placeholder="15-16 haneli sayısal ID giriniz"
                    description="Meta reklamları için kullanılan pixel kimlik numaranız"
                    error={metaPixelErrors.pixelId?.message}
                  />
                )}
              />
            </Stack>
            <Button
              variant="outline"
              color="blue"
              fullWidth
              mt="auto"
              type="submit"
              loading={isSubmittingMetaPixel}
            >
              Ayarları Kaydet
            </Button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {renderForm()}
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </div>
  );
};

export default GoogleAnalyticsForm;
