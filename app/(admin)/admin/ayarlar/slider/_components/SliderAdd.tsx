"use client";

import FeedbackDialog from "@/components/FeedbackDialog";
import { AddSliderSchema, AddSliderSchemaType } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Paper,
  Stack,
  Switch,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import CustomDropzone from "../../../urunler/_components/CustomDropzone";
import { addSliderAction } from "../_actions/SliderAction";

const SliderAdd = () => {
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const form = useForm<AddSliderSchemaType>({
    resolver: zodResolver(AddSliderSchema),
    defaultValues: {
      title: "",
      text: "",
      buttonTitle: "",
      buttonLink: "/",
      isPublished: true,
      imageFile: [],
    },
  });
  const { push } = useRouter();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
    watch,
  } = form;

  const onSubmit: SubmitHandler<AddSliderSchemaType> = async (
    data: AddSliderSchemaType,
  ) => {
    try {
      await addSliderAction(data).then((res) => {
        if (res.success) {
          setFeedbackState({
            isOpen: true,
            message: "Ürün başarıyla eklendi",
            type: "success",
          });
          push("/admin/ayarlar/slider");
        }
        if (!res.success) {
          setFeedbackState({
            isOpen: true,
            message: "Ürün eklenirken bir hata oluştu",
            type: "error",
          });
        }
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  const isMultiple = watch("isDescription");
  return (
    <Paper shadow="xs" p="xl" className="mx-auto max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <CustomDropzone
            control={control}
            name="imageFile"
            isForce
            maxFiles={1}
            videosEnabled
          />
          <Controller
            name="alt"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Alt"
                description="Bu alan ürününüzün görünürlüğü için gereklidir"
                error={errors.alt?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="isDescription"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Switch
                checked={value}
                onChange={(event) => onChange(event.currentTarget.checked)}
                description="Bannera fonksiyonalite eklemek için"
                {...field}
              />
            )}
          />
          <Controller
            name="isPublished"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Switch
                label="Yayınla"
                checked={value}
                onChange={(event) => onChange(event.currentTarget.checked)}
                className="mt-2"
                {...field}
              />
            )}
          />
          {isMultiple && (
            <Fragment>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Başlık"
                    placeholder="Slider başlığını girin"
                    error={errors.title?.message}
                    {...field}
                  />
                )}
              />

              <Controller
                name="text"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Metin"
                    placeholder="Slider açıklamasını girin"
                    minRows={3}
                    error={errors.text?.message}
                    {...field}
                  />
                )}
              />

              <Controller
                name="buttonTitle"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Buton Başlığı"
                    placeholder="Buton metnini girin"
                    error={errors.buttonTitle?.message}
                    {...field}
                  />
                )}
              />

              <Controller
                name="buttonLink"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Buton Linki"
                    description="/ornek-sayfa"
                    error={errors.buttonLink?.message}
                    {...field}
                  />
                )}
              />
            </Fragment>
          )}
          <Button
            type="submit"
            size="md"
            className="mt-4 w-full"
            loading={isSubmitting}
            variant="filled"
          >
            Slider Ekle
          </Button>
        </Stack>
      </form>
      <FeedbackDialog
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState((prev) => ({ ...prev, isOpen: false }))}
        message={feedbackState.message}
        type={feedbackState.type}
      />
    </Paper>
  );
};

export default SliderAdd;
