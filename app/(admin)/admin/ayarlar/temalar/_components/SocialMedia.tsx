"use client";
import {
  SocialMediaPreviewSchema,
  SocialMediaPreviewType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  CloseButton,
  ColorPicker,
  FileButton,
  Text,
  TextInput,
  Textarea,
  UnstyledButton,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { DeteleSeoImage, EditTheme } from "../_actions/ThemeAction";
import FeedbackDialog from "@/components/FeedbackDialog";
import { Fragment, useEffect, useState } from "react";
import Image from "next/image";

interface SocialMediaProps {
  data?: {
    id: string;
    title?: string | null;
    description?: string | null;
    themeColor?: string | null;
    image?: {
      url?: string | null;
    } | null;
  } | null;
}

const SocialMedia = ({ data }: SocialMediaProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<SocialMediaPreviewType>({
    resolver: zodResolver(SocialMediaPreviewSchema),
    defaultValues: {
      logo: undefined,
      title: data?.title || "",
      description: data?.description || "",
      themeColor: data?.themeColor || "#2e2e2e",
    },
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(true);
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch and create blob URL for existing image
  useEffect(() => {
    const fetchImage = async () => {
      if (data?.image?.url) {
        try {
          const imageUrl = `/api/user/asset/get-image?width=200&quality=80&url=${data.image.url}`;
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setPreviewUrl(objectUrl);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImage();

    // Cleanup function
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [data?.image?.url]);

  const handleImageDelete = async () => {
    try {
      setIsDeleting(true);
      setShowImage(false); // Resmi gizle
      setValue("logo", undefined);

      // Resmin DOM'dan tamamen kaldırılması için bekle
      await new Promise((resolve) => setTimeout(resolve, 500));

      const res = await DeteleSeoImage(data?.id);
      setFeedbackState({
        isOpen: true,
        message: res.success ? "Resim başarıyla silindi." : res.message,
        type: res.success ? "success" : "error",
      });

      if (res.success) {
        setPreviewUrl(null);
        reset();
        setTimeout(() => {
          refresh();
        }, 100);
      }
    } catch (error) {
      console.error("Resim silinirken hata:", error);
      setFeedbackState({
        isOpen: true,
        message: "Resim silinirken bir hata oluştu",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
      setShowImage(true); // Resim alanını tekrar göster
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setValue("logo", [file]);
    } else {
      setPreviewUrl(null);
      setValue("logo", undefined);
    }
  };

  const onSubmit: SubmitHandler<SocialMediaPreviewType> = async (formData) => {
    const response = await EditTheme(formData);
    setFeedbackState({
      isOpen: true,
      message: response.success
        ? "Tema başarıyla güncellendi."
        : response.message,
      type: response.success ? "success" : "error",
    });
    if (response.success) {
      reset();
    }
    refresh();
  };

  const { refresh } = useRouter();

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
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full md:w-40 lg:flex lg:items-center">
          <div className="relative">
            {!data?.image?.url || isDeleting ? (
              <FileButton
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp"
              >
                {(props) => (
                  <UnstyledButton {...props} className="w-full">
                    <div className="relative flex h-40 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:border-gray-400 md:w-40">
                      {previewUrl && showImage && (
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )}
                    </div>
                  </UnstyledButton>
                )}
              </FileButton>
            ) : (
              <div className="relative flex h-40 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 md:w-40">
                {!isDeleting && previewUrl && showImage && (
                  <Fragment>
                    <Image
                      src={previewUrl}
                      alt="Current image"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <ActionIcon
                      variant="transparent"
                      className="absolute -right-1 -top-1 z-10"
                      onClick={handleImageDelete}
                    >
                      <CloseButton />
                    </ActionIcon>
                  </Fragment>
                )}
              </div>
            )}
          </div>
          {errors.logo && (
            <Text size="xs" c="red" className="mt-1">
              {errors.logo.message}
            </Text>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Sayfa Başlığı"
                error={errors.title?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Ana sayfa başlığı"
                error={errors.description?.message}
                {...field}
              />
            )}
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Tema renginizi belirtebilirsiniz. Buradaki renkler butonlarınızı vb.
          şeylerinizin rengini belirtir.
        </p>
        <Controller
          name="themeColor"
          control={control}
          render={({ field }) => (
            <div>
              <ColorPicker
                format="hex"
                value={field.value}
                onChange={field.onChange}
                swatches={themeColors}
              />
              {errors.themeColor && (
                <Text size="xs" c="red">
                  {errors.themeColor.message}
                </Text>
              )}
            </div>
          )}
        />
      </div>

      <div className="mt-4 space-y-1">
        <span className="block text-xs text-gray-500">
          Ana sayfa açıklaması giriniz. Buraya girdiğiniz başlık ve açıklama
          sosyal medya paylaşımlarında görünecektir.
        </span>
        <span className="block text-xs text-gray-500">
          Önerilen boyut: 512x512px.
        </span>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          type="submit"
          className="w-full md:w-auto"
          loading={isSubmitting}
        >
          Kaydet
        </Button>
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
