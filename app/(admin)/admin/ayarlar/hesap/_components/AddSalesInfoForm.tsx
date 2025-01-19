"use client";
import CustomImage from "@/components/CustomImage";
import FeedbackDialog from "@/components/FeedbackDialog";
import { SalerInfoFormValues, SalerInfoSchema } from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Card,
  CloseButton,
  Grid,
  InputBase,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
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
import { AddInfo, DeleteImageOnSalerInfo } from "../_actions/SalerInfoAction";
import { info } from "../page";
import { CiCircleInfo } from "react-icons/ci";

const AddSalesInfoForm = ({ info }: { info: info }) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const { control, handleSubmit, formState, reset } =
    useForm<SalerInfoFormValues>({
      resolver: zodResolver(SalerInfoSchema),
      defaultValues: {
        address: info?.address,
        contactEmail: info?.contactEmail,
        contactPhone: info?.contactPhone,
        facebook: info?.facebook,
        instagram: info?.instagram,
        pinterest: info?.pinterest,
        storeDescription: info?.storeDescription,
        storeName: info?.storeName,
        twitter: info?.twitter,
        whatsapp: info?.whatsapp,
        whatsappStarterText: info?.whatsappStarterText,
      },
    });

  const { refresh } = useRouter();

  const onSubmit: SubmitHandler<SalerInfoFormValues> = async (data) => {
    await AddInfo(data).then((res) => {
      if (res.success) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "success",
        });
      }
      if (!res.success) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "error",
        });
      }
      refresh();
    });
  };
  const SalerInfoDeleteImage = async () => {
    try {
      if (!info?.logo?.url) return;

      if (info?.logo.url) {
        await DeleteImageOnSalerInfo(info.logo.url).then((res) => {
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
        });
      }
    } catch (error) {
    } finally {
      refresh();
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="lg">
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <div className="flex items-center gap-2">
              <CiCircleInfo size={20} />
              <Title order={3}>Firma Kimliği</Title>
            </div>
          </Card.Section>

          <Text size="sm" className="mb-6 mt-4 text-gray-600">
            Bu bölümde firmanızın temel bilgilerini ve görsel kimliğini
            tanımlayabilirsiniz. Logo ve firma adı gibi temel bilgiler,
            markanızın dijital yüzünü oluşturur.  
          </Text>

          {info?.logo?.url && (
            <Card.Section className="relative my-4 h-24 w-full">
              <ActionIcon
                onClick={SalerInfoDeleteImage}
                variant="transparent"
                className="absolute right-0 top-0 z-10"
              >
                <CloseButton />
              </ActionIcon>
              <CustomImage src={info.logo.url} objectFit="contain" />
            </Card.Section>
          )}

          <Stack gap="md">
            {!info?.logo?.url && (
              <div className="flex flex-col">
                <h1 className="mb-2 text-sm font-medium">Logo</h1>
                <CustomDropzone name="logo" control={control} maxFiles={1} />
              </div>
            )}

            <Controller
              name="storeName"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  radius="md"
                  className="mb-4"
                  description="Firmanızın resmi adı, tüm platformlarda tutarlı şekilde görünecektir."
                  error={formState.errors?.storeName?.message}
                  label="Firma Adı"
                  placeholder="Firmanızın tam adını giriniz"
                  size="sm"
                />
              )}
            />

            <Controller
              name="storeDescription"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  radius="md"
                  label="Firma Açıklaması"
                  description="Müşterilerinize firmanızı en iyi şekilde tanıtın. Bu metin SEO açısından önemlidir."
                  error={formState.errors?.storeDescription?.message}
                  placeholder="Firmanızı kısaca tanıtın"
                  minRows={3}
                  size="sm"
                />
              )}
            />
          </Stack>
        </Card>

        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <div className="flex items-center gap-2">
              <CiCircleInfo size={20} />
              <Title order={3}>İletişim Bilgileri</Title>
            </div>
          </Card.Section>

          <Text size="sm" className="mb-6 mt-4 text-gray-600">
            Müşterilerinizin size kolayca ulaşabilmesi için tüm iletişim
            kanallarınızı eksiksiz doldurun. Bu bilgiler web sitenizde ve diğer
            platformlarda görünür olacaktır.
          </Text>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Controller
                name="contactEmail"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    radius="md"
                    error={formState.errors?.contactEmail?.message}
                    label="Firma Email Adresi"
                    description="Kurumsal iletişim için kullanılacak ana email adresi"
                    placeholder="info@firma.com"
                    size="sm"
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Controller
                name="contactPhone"
                control={control}
                render={({ field }) => (
                  <InputBase
                    {...field}
                    component={IMaskInput}
                    mask="(500) 000 00 00"
                    error={formState.errors?.contactPhone?.message}
                    label="Firma Telefon Numarası"
                    description="Müşteri hizmetleri için ana telefon numarası"
                    placeholder="(5XX) XXX XX XX"
                    size="sm"
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    radius="md"
                    error={formState.errors?.address?.message}
                    label="Firma Adresi"
                    description="Fiziksel mağaza veya ofis adresiniz"
                    placeholder="Açık adresinizi giriniz"
                    minRows={3}
                    size="sm"
                  />
                )}
              />
            </Grid.Col>
          </Grid>
        </Card>

        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <div className="flex items-center gap-2">
              <CiCircleInfo size={20} />
              <Title order={3}>Sosyal Medya Hesapları</Title>
            </div>
          </Card.Section>

          <Text size="sm" className="mb-6 mt-4 text-gray-600">
            Sosyal medya hesaplarınız, müşterilerinizle etkileşim kurmanın en
            etkili yollarından biridir. Aktif olarak kullandığınız platformları
            ekleyin.
          </Text>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="whatsapp"
                control={control}
                render={({ field }) => (
                  <InputBase
                    {...field}
                    component={IMaskInput}
                    mask="(500) 000 00 00"
                    error={formState.errors?.whatsapp?.message}
                    label="WhatsApp İletişim Hattı"
                    description="Müşteri destek hattı olarak kullanılacak numara"
                    rightSection={<FaWhatsapp className="text-green-600" />}
                    placeholder="(5XX) XXX XX XX"
                    size="sm"
                  />
                )}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="whatsappStarterText"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    radius="md"
                    error={formState.errors?.instagram?.message}
                    label="Whatsapp Başlangıç Mesajı"
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
                    radius="md"
                    error={formState.errors?.instagram?.message}
                    label="Instagram"
                    description="Kullanıcı adınızı @ işareti olmadan yazın"
                    rightSection={<FaInstagram className="text-pink-600" />}
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
                    radius="md"
                    error={formState.errors?.facebook?.message}
                    label="Facebook"
                    description="Facebook sayfa kullanıcı adınızı girin"
                    rightSection={<FaFacebook />}
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
                    radius="md"
                    error={formState.errors?.twitter?.message}
                    label="Twitter"
                    description="Twitter kullanıcı adınızı @ işareti olmadan yazın"
                    rightSection={<FaTwitter className="text-blue-400" />}
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
                    radius="md"
                    error={formState.errors?.pinterest?.message}
                    label="Pinterest"
                    description="Pinterest kullanıcı adınızı girin"
                    rightSection={<FaPinterest className="text-red-600" />}
                    size="sm"
                  />
                )}
              />
            </Grid.Col>
          </Grid>
        </Card>

        <Grid justify="flex-end">
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <Button
              loading={formState.isSubmitting}
              type="submit"
              fullWidth
              size="md"
              variant="outline"
              color="black"
            >
              {info ? "Bilgileri Güncelle" : "Bilgileri Kaydet"}
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>

      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </form>
  );
};

export default AddSalesInfoForm;
