"use client";
import CustomImage from "@/components/CustomImage";
import FeedbackDialog from "@/components/FeedbackDialog";
import { SalerInfoFormValues, SalerInfoSchema } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Grid,
  InputBase,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { IMaskInput } from "react-imask";
import CustomDropzone from "../../../urunler/_components/CustomDropzone";
import { AddInfo } from "../_actions/SalerInfoAction";
import { info } from "../page";

const AddSalesInfoForm = React.memo(function AddSalesInfoForm({
  info,
}: {
  info: info;
}) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const defaultValues = {} as SalerInfoFormValues; // Boş başlat

  const { control, handleSubmit, formState, setValue, trigger, watch, reset } =
    useForm<SalerInfoFormValues>({
      resolver: zodResolver(SalerInfoSchema),
      defaultValues,
    });

  useEffect(() => {
    if (info) {
      reset({
        storeName: info.storeName || "",
        storeDescription: info.storeDescription || "",
        address: info.address || "",
        contactEmail: info.contactEmail || "",
        contactPhone: info.contactPhone || "",
        whatsapp: info.whatsapp || "",
        instagram: info.instagram || "",
        pinterest: info.pinterest || "",
        twitter: info.twitter || "",
        facebook: info.facebook || "",
        seoTitle: info.seoTitle || "",
        seoDescription: info.seoDescription || "",
      });
    }
  }, [info, reset]);
  const { refresh } = useRouter();

  const onSubmit: SubmitHandler<SalerInfoFormValues> = async (data) => {
    const formData: SalerInfoFormValues = {
      ...data,
      logo: data.logo || [],
    };

    await AddInfo(formData).then(async (res) => {
      if (res.status) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "success",
        });

        refresh();
        reset({}, { keepDefaultValues: true }); // keepDefaultValues opsiyonu eklenmiş
      }
      if (!res.status) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "error",
        });
      }
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card padding={"xs"} radius="sm" shadow="sm">
        {info?.logo.url && (
          <Card.Section className="relative my-4 h-24 w-full">
            <CustomImage src={info.logo.url} objectFit="contain" />
          </Card.Section>
        )}
        <div className="flex flex-col">
          <h1>Logo</h1>
          <CustomDropzone
            name="logo"
            control={control}
            maxFiles={5}
            videosEnabled={true}
          />
        </div>

        <Grid gutter={{ base: "sm", sm: "md" }}>
          <Grid.Col span={{ base: 12, md: 12 }}>
            <Controller
              name="storeName"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  radius="sm"
                  error={formState.errors?.storeName?.message}
                  label="Firma Adı"
                  placeholder="Firmanızın tam adını giriniz"
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Controller
              name="storeDescription"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  radius="sm"
                  label="Firma Açıklaması"
                  error={formState.errors?.storeDescription?.message}
                  placeholder="Firmanızı kısaca tanıtın"
                  minRows={3}
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  radius="sm"
                  error={formState.errors?.address?.message}
                  label="Firma Adresi"
                  placeholder="Açık adresinizi giriniz"
                  minRows={3}
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Controller
              name="contactEmail"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  radius="sm"
                  error={formState.errors?.contactEmail?.message}
                  label="Firma Email Adresi"
                  placeholder="ornek@firma.com"
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Controller
              name="contactPhone"
              control={control}
              render={({ field }) => (
                <InputBase
                  {...field}
                  component={IMaskInput}
                  mask="(500) 000 00 00"
                  error={formState.errors?.contactPhone?.message}
                  label="Firma Telefon numarası"
                  placeholder="(5XX) XXX XX XX"
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Controller
              name="whatsapp"
              control={control}
              render={({ field }) => (
                <InputBase
                  {...field}
                  component={IMaskInput}
                  mask="(500) 000 00 00"
                  error={formState.errors?.whatsapp?.message}
                  label="Firma Whatsapp numarası"
                  rightSection={<FaWhatsapp />}
                  placeholder="(5XX) XXX XX XX"
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Controller
              name="instagram"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  radius="sm"
                  error={formState.errors?.instagram?.message}
                  label="Firma Instagram Kullanıcı Adı"
                  rightSection={<FaInstagram />}
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Controller
              name="pinterest"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  radius="sm"
                  error={formState.errors?.pinterest?.message}
                  label="Firma Pinterest Kullanıcı Adı"
                  rightSection={<FaPinterest />}
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Controller
              name="twitter"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  radius="sm"
                  error={formState.errors?.twitter?.message}
                  label="Firma Twitter Kullanıcı Adı"
                  rightSection={<FaTwitter />}
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Controller
              name="facebook"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  radius="sm"
                  error={formState.errors?.facebook?.message}
                  label="Firma Facebook Kullanıcı Adı"
                  rightSection={<FaFacebook />}
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Controller
              name="seoTitle"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  radius="sm"
                  label="SEO Başlığı"
                  error={formState.errors?.seoTitle?.message}
                  placeholder="50-60 karakter arası önerilir"
                  maxLength={60}
                  minRows={2}
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Controller
              name="seoDescription"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  radius="sm"
                  label="SEO Açıklaması"
                  error={formState.errors?.seoDescription?.message}
                  placeholder="150-160 karakter arası önerilir"
                  maxLength={160}
                  minRows={2}
                  size="sm"
                />
              )}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Button loading={formState.isSubmitting} type="submit" fullWidth>
              {info ? "Güncelle" : "Onayla"}
            </Button>
          </Grid.Col>
        </Grid>
      </Card>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </form>
  );
});

export default AddSalesInfoForm;
