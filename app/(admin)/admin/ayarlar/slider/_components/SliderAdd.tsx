"use client";

import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Stack,
  TextInput,
  Textarea,
  Switch,
  Paper,
} from "@mantine/core";
import ImageDropzone from "../../../_components/ImageDropzone";
import { AddSliderSchemaType, AddSliderSchema } from "@/zodschemas/authschema";
import { addSliderAction } from "../_actions/SliderAction";
import FeedbackDialog from "@/components/FeedbackDialog";
import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";

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
    register,
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
          <ImageDropzone
            name="imageFile"
            setValue={setValue}
            trigger={trigger}
            value={form.watch("imageFile")}
            error={errors.imageFile?.message}
            required
            isNotMultiple
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
      </form>{" "}
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
