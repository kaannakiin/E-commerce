"use client";

import CustomImage from "@/components/CustomImage";
import FeedbackDialog from "@/components/FeedbackDialog";
import {
  SocialMediaPreviewSchema,
  SocialMediaPreviewType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  CloseButton,
  ColorInput,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import CustomDropzone from "../../../urunler/_components/CustomDropzone";
import { SocialMediaProps } from "../page";
import {
  DeleteImageOnMainSeoSettings,
  EditMainSeoSettings,
} from "../_actions/ThemeAction";

const SocialMedia = ({ data }: { data: SocialMediaProps }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SocialMediaPreviewType>({
    resolver: zodResolver(SocialMediaPreviewSchema),
    defaultValues: {
      favicon: undefined,
      logo: undefined,
      themeColor1: data?.themeColor || "#2e2e2e",
      themeColor2: data?.themeColorSecondary || "#2e2e2e",
    },
  });

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

  const handleImageDelete = async (type: "favicon" | "mainPageImage") => {
    try {
      await DeleteImageOnMainSeoSettings({
        type: type === "favicon" ? "favicon" : "mainPageImage",
      }).then((res) => {
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
      });
    } catch (error) {
    } finally {
      refresh();
    }
  };
  const onSubmit: SubmitHandler<SocialMediaPreviewType> = async (formData) => {
    try {
      await EditMainSeoSettings(formData).then((res) => {
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
      });
    } catch (error) {
      setFeedbackState({
        isOpen: true,
        message: "Bir hata oluştu",
        type: "error",
      });
    } finally {
      refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-3xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {data?.image?.url ? (
            <div className="relative h-full min-h-52 w-full min-w-52">
              <CustomImage
                src={data.image.url}
                quality={100}
                objectFit="contain"
              />
              <CloseButton
                size="sm"
                className="absolute right-2 top-2 rounded-full bg-white shadow-sm hover:bg-gray-100"
                onClick={() => handleImageDelete("mainPageImage")}
              />
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-base font-medium">
                Ana Sayfa Paylaşım Görseli
              </h2>
              <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                <CustomDropzone control={control} name="logo" maxFiles={1} />
              </div>
            </div>
          )}

          {data?.favicon?.url ? (
            <div className="relative h-full w-full">
              <CustomImage
                src={data.favicon.url}
                quality={100}
                objectFit="contain"
              />
              <CloseButton
                size="sm"
                className="absolute right-2 top-2 rounded-full bg-white shadow-sm hover:bg-gray-100"
                onClick={() => handleImageDelete("favicon")}
              />
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-base font-medium">Favicon</h2>
              <p className="mb-4 text-sm text-gray-500">
                Tarayıcı sekmesinde ve yer imlerinde görünecek site ikonudur.
                İdeal boyutlar:
              </p>
              <ul className="mb-4 space-y-1.5 text-sm text-gray-500">
                <li>• Önerilen boyut: 32x32 piksel (genel kullanım)</li>
                <li>• Yüksek çözünürlük için: 48x48 piksel</li>
              </ul>
              <p className="text-sm text-gray-500">
                PNG formatında, şeffaf arka planlı ve net görünümlü bir ikon
                yükleyiniz. Küçük boyutlarda bile okunabilir olmalıdır.
              </p>
              <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                <CustomDropzone control={control} name="favicon" maxFiles={1} />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-base font-medium">Tema Rengi</h2>
          <p className="mb-4 text-sm text-gray-500">
            Tema renginizi belirtebilirsiniz. Seçtiğiniz renk butonlar ve diğer
            öğeler için kullanılacaktır.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                1. Tema Rengi
              </label>
              <Controller
                name="themeColor1"
                control={control}
                render={({ field }) => (
                  <div>
                    <ColorInput
                      format="hex"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                      size="sm"
                    />
                    {errors.themeColor1 && (
                      <Text className="mt-2 text-sm text-red-500">
                        {errors.themeColor1.message}
                      </Text>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                2. Tema Rengi
              </label>
              <Controller
                name="themeColor2"
                control={control}
                render={({ field }) => (
                  <div>
                    <ColorInput
                      format="hex"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                      size="sm"
                    />
                    {errors.themeColor2 && (
                      <Text className="mt-2 text-sm text-red-500">
                        {errors.themeColor2.message}
                      </Text>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} variant="outline">
            Kaydet
          </Button>
        </div>
      </div>

      <FeedbackDialog
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState((prev) => ({ ...prev, isOpen: false }))}
        message={feedbackState.message}
        type={feedbackState.type}
      />
    </form>
  );
};

export default SocialMedia;
