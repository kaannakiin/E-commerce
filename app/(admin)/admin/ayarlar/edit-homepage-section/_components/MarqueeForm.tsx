"use client";
import { MarqueeFormValues, marquueFormSchema } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ColorInput,
  rem,
  Slider,
  TextInput,
  Text,
  Button,
  Switch,
} from "@mantine/core";
import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { GiEyedropper } from "react-icons/gi";
import { MarqueeAction } from "../_actions/MarqueeAction";

const MarqueeForm = ({
  text,
  textColor,
  textPadding,
  bgColor,
  fontSize,
  slidingSpeed,
  isActive,
  url,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MarqueeFormValues>({
    resolver: zodResolver(marquueFormSchema),
    defaultValues: {
      fontSize: Number(fontSize) || 16, // varsayılan değer
      isActive: isActive ?? true, // varsayılan değer
      slidingSpeed: Number(slidingSpeed) || 20, // varsayılan değer
      text: text || "",
      textColor: textColor || "#000000",
      textPadding: Number(textPadding) || 10, // varsayılan değer
      url: url || "#",
      bgColor: bgColor || "#FFFFFF",
    },
  });
  const onSubmit: SubmitHandler<MarqueeFormValues> = async (data) => {
    await MarqueeAction(data);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg bg-white p-6"
    >
      <h1 className="text-center text-xl font-bold">
        Üst Başlık Akan Yazı Düzenleme
      </h1>
      <div className="space-y-6">
        <Controller
          name="text"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Akan Yazı"
              className="w-full"
              error={errors.text?.message}
              {...field}
            />
          )}
        />

        <div className="space-y-2">
          <Text className="font-medium text-gray-700">Yazı Büyüklüğü (px)</Text>
          <Controller
            name="fontSize"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Slider
                min={10}
                max={100}
                value={value}
                onChange={onChange}
                label={(value) => value.toString() + " px"}
                className="mt-1"
                marks={[
                  { value: 10, label: "10" },
                  { value: 100, label: "100" },
                ]}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Text className="font-medium text-gray-700">
            Yazılar Arası Boşluk (px)
          </Text>
          <Controller
            name="textPadding"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Slider
                min={10}
                max={100}
                value={value} // direkt value kullan
                onChange={onChange} // direkt onChange kullan
                label={(value) => `${value} px`}
                marks={[
                  { value: 10, label: "10" },
                  { value: 100, label: "100" },
                ]}
                className="mt-1"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Text className="font-medium text-gray-700">Kayma Hızı</Text>
          <Controller
            name="slidingSpeed"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Slider
                min={10}
                max={200}
                value={value} // direkt value kullan
                onChange={onChange} // direkt onChange kullan
                marks={[{ value: 200, label: "200" }]}
                className="mt-1"
              />
            )}
          />
        </div>

        <Controller
          name="textColor"
          control={control}
          render={({ field }) => (
            <ColorInput
              label="Yazı Rengi"
              description="Sağ tarafta bulunan renk seçiciyi kullanarak renk seçebilirsiniz."
              error={errors.textColor?.message}
              eyeDropperIcon={
                <GiEyedropper
                  style={{ width: rem(18), height: rem(18) }}
                  fontWeight={500}
                />
              }
              className="w-full"
              {...field}
            />
          )}
        />

        <Controller
          name="bgColor"
          control={control}
          render={({ field }) => (
            <ColorInput
              label="Arkaplan Rengi"
              description="Sağ tarafta bulunan renk seçiciyi kullanarak renk seçebilirsiniz."
              error={errors.bgColor?.message}
              eyeDropperIcon={
                <GiEyedropper
                  style={{ width: rem(18), height: rem(18) }}
                  fontWeight={500}
                />
              }
              className="w-full"
              {...field}
            />
          )}
        />

        <Controller
          name="isActive"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              label="Aktif"
              checked={value}
              onChange={(event) => onChange(event.currentTarget.checked)}
              className="w-fit"
            />
          )}
        />

        <Controller
          name="url"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Yönlendirmek istediğiniz Url"
              description="Bir yönlendirme yapmak istemiyorsunuz # işareti koyunuz. Mutlaka / ile başlamalıdır."
              placeholder="Örnek: /anasayfa"
              error={errors.url?.message}
              {...field}
            />
          )}
        />

        <Button type="submit" fullWidth loading={isSubmitting}>
          Kaydet
        </Button>
      </div>
    </form>
  );
};

export default MarqueeForm;
