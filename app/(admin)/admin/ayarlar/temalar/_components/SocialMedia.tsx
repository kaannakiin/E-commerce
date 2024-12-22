"use client";

import {
  SocialMediaPreviewSchema,
  SocialMediaPreviewType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  CloseButton,
  ColorPicker,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { DeteleSeoImage, EditTheme } from "../_actions/ThemeAction";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useState } from "react";
import CustomDropzone from "../../../urunler/_components/CustomDropzone";
import { SocialMediaProps } from "../page";
import CustomImage from "@/components/CustomImage";

const SocialMedia = ({ data }: { data: SocialMediaProps }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SocialMediaPreviewType>({
    resolver: zodResolver(SocialMediaPreviewSchema),
    defaultValues: {
      favicon: undefined,
      logo: undefined,
      title: data?.title || "",
      description: data?.description || "",
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

  const handleImageDelete = async (url: string, type: "favicon" | "logo") => {
    await DeteleSeoImage(url, type).then((res) => {
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
    refresh();
  };
  const onSubmit: SubmitHandler<SocialMediaPreviewType> = async (formData) => {
    const response = await EditTheme(formData);
    if (response.success) {
      setFeedbackState({
        isOpen: true,
        message: response.message,
        type: "success",
      });
      refresh();
    } else {
      setFeedbackState({
        isOpen: true,
        message: response.message,
        type: "error",
      });
    }
  };

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-3xl"
    >
      <div className="space-y-8">
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
                onClick={() => handleImageDelete(data.image.url, "logo")}
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
                onClick={() => handleImageDelete(data.favicon.url, "favicon")}
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
                <li>• Apple Touch Icon için: 180x180 piksel</li>
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

        <div className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sayfa Başlığı
                </label>
                <TextInput
                  placeholder="Sitenizin başlığını girin"
                  className="w-full"
                  error={errors.title?.message}
                  {...field}
                />
              </div>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ana Sayfa Başlığı
                </label>
                <Textarea
                  placeholder="Ana sayfa açıklamasını girin"
                  className="w-full"
                  minRows={4}
                  error={errors.description?.message}
                  {...field}
                />
              </div>
            )}
          />
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
                    <ColorPicker
                      format="hex"
                      value={field.value}
                      onChange={field.onChange}
                      swatches={themeColors}
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
                    <ColorPicker
                      format="hex"
                      value={field.value}
                      onChange={field.onChange}
                      swatches={themeColors}
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
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-base font-medium">Google Ayarları</h2>
          <p className="mb-4 text-sm text-gray-500">
            Google Analytics ve Google VerificationID ile sitenizi google&apos;a
            tanıtabilirsiniz.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              control={control}
              name="googleId"
              render={(field) => (
                <TextInput
                  label="Google Analytics ID"
                  description='"G-" veya "AW-" ile başlayan kod'
                  error={errors?.googleId?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="googleVerification"
              render={(field) => (
                <TextInput
                  label="Google Analytics ID"
                  description='Google"dan alacağınız kod'
                  error={errors?.googleVerification?.message}
                />
              )}
            />
          </div>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Ana sayfa açıklaması giriniz. Buraya girdiğiniz başlık ve
              açıklama sosyal medya paylaşımlarında görünecektir.
            </p>
            <p>• Önerilen görsel boyutu: 512x512px</p>{" "}
            <p>• Önerilen favicon boyutu: 32x32px</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            loading={isSubmitting}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
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
