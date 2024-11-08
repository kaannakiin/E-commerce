"use client";
import { useState } from "react";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  ActionIcon,
  Card,
  Tooltip,
} from "@mantine/core";
import { SubmitHandler, useForm } from "react-hook-form";
import ImageDropzone from "./ImageDropzone";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import {
  AddHeroSchema,
  AddHeroSchemaType,
  EditHeroSchema,
  EditHeroSchemaType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import FeedbackDialog from "@/components/FeedbackDialog";
import { EditHeroHeader } from "@/actions/admin/sections/heroheader/EditHeroHeader";
import { AddHeroHeader } from "@/actions/admin/sections/heroheader/AddHeroHeader";
import { DeleteHeroHeader } from "@/actions/admin/sections/heroheader/DeleteHeroHeader";

interface HeroData {
  id: string;
  title: string;
  text: string;
  buttonTitle: string;
  buttonLink: string;
  image: { url: string };
}

const AddHeroForm = () => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const router = useRouter();

  const {
    setValue,
    trigger,
    watch,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddHeroSchemaType>({
    resolver: zodResolver(AddHeroSchema),
    defaultValues: {
      title: "",
      text: "",
      buttonTitle: "",
      buttonLink: "",
      imageFile: [],
    },
  });

  const onSubmit: SubmitHandler<AddHeroSchemaType> = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("text", data.text);
    formData.append("buttonTitle", data.buttonTitle);
    formData.append("buttonLink", data.buttonLink);
    formData.append("imageFile", data.imageFile[0]);

    await AddHeroHeader(formData).then((res) => {
      if (res.success) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "success",
        });
        router.refresh();
      } else {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "error",
        });
      }
    });
  };

  return (
    <Stack gap="xl">
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="md">
          <Title order={2}>Hero Section Oluştur</Title>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
              <Card withBorder radius="md" p="md">
                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    Hero Görseli
                  </Text>
                  <ImageDropzone
                    name="imageFile"
                    setValue={setValue}
                    trigger={trigger}
                    value={watch("imageFile")}
                    maxFiles={1}
                    required={true}
                    isNotMultiple={true}
                  />
                  {errors.imageFile && (
                    <Text size="sm" c="red">
                      {errors.imageFile.message}
                    </Text>
                  )}
                </Stack>
              </Card>

              <TextInput
                label="Başlık"
                placeholder="Hero section başlığı"
                required
                {...register("title")}
                error={errors.title?.message}
                onChange={(e) =>
                  setValue("title", e.target.value, { shouldValidate: true })
                }
              />

              <TextInput
                label="Açıklama"
                placeholder="Hero section açıklaması"
                required
                {...register("text")}
                error={errors.text?.message}
                onChange={(e) =>
                  setValue("text", e.target.value, { shouldValidate: true })
                }
              />

              <Group grow>
                <TextInput
                  label="Buton Başlığı"
                  placeholder="Örn: Başla"
                  required
                  {...register("buttonTitle")}
                  error={errors.buttonTitle?.message}
                  onChange={(e) =>
                    setValue("buttonTitle", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                />
                <TextInput
                  label="Buton Linki"
                  placeholder="Örn: /get-started"
                  required
                  {...register("buttonLink")}
                  error={errors.buttonLink?.message}
                  onChange={(e) =>
                    setValue("buttonLink", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                />
              </Group>

              <Group justify="flex-end" mt="md">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  leftSection={<AiOutlineEdit size={16} />}
                >
                  Oluştur
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </Stack>
  );
};

const EditHeroForm = ({ initialData }: { initialData: HeroData }) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const router = useRouter();

  const {
    setValue,
    trigger,
    watch,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditHeroSchemaType>({
    resolver: zodResolver(EditHeroSchema),
    defaultValues: {
      title: initialData.title,
      text: initialData.text,
      buttonTitle: initialData.buttonTitle,
      buttonLink: initialData.buttonLink,
      imageFile: [],
    },
  });

  const onSubmit: SubmitHandler<EditHeroSchemaType> = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("text", data.text);
    formData.append("buttonTitle", data.buttonTitle);
    formData.append("buttonLink", data.buttonLink);

    if (data.imageFile && data.imageFile.length > 0) {
      formData.append("imageFile", data.imageFile[0]);
    }
    await EditHeroHeader(formData, initialData.id).then((res) => {
      if (res.success) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "success",
        });
        router.refresh();
      } else {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "error",
        });
      }
    });
  };

  const handleDelete = async () => {
    await DeleteHeroHeader(initialData.id).then((res) => {
      if (res.success) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "success",
        });
        router.refresh();
      } else {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "error",
        });
      }
    });
  };

  return (
    <Stack gap="xl">
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2}>Hero Section Düzenle</Title>
            <Tooltip label="Hero Section'ı Sil">
              <ActionIcon color="red" variant="subtle" onClick={handleDelete}>
                <AiOutlineDelete size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
              <Stack gap="xl">
                {/* Mevcut Video/Görsel */}
                <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-lg shadow-lg bg-gray-900">
                  <div className="relative aspect-video">
                    <video
                      src={`/api/user/asset/get-video?url=${initialData.image.url.replace(
                        /\.mp4$/,
                        ""
                      )}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      controls
                      controlsList="nodownload"
                      playsInline
                      loop
                      autoPlay
                      preload="metadata"
                      poster="/video-placeholder.jpg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Optional new image upload */}
                <Card withBorder radius="md" p="md">
                  <Stack gap="xs">
                    <Text fw={500} size="sm">
                      Yeni Görsel Yükle (İsteğe Bağlı)
                    </Text>
                    <ImageDropzone
                      name="imageFile"
                      setValue={setValue}
                      trigger={trigger}
                      value={watch("imageFile")}
                      maxFiles={1}
                      required={false}
                      isNotMultiple={true}
                    />
                    {errors.imageFile && (
                      <Text size="sm" c="red">
                        {errors.imageFile.message}
                      </Text>
                    )}
                  </Stack>
                </Card>
              </Stack>

              <TextInput
                label="Başlık"
                placeholder="Hero section başlığı"
                required
                {...register("title")}
                error={errors.title?.message}
                onChange={(e) =>
                  setValue("title", e.target.value, { shouldValidate: true })
                }
              />

              <TextInput
                label="Açıklama"
                placeholder="Hero section açıklaması"
                required
                {...register("text")}
                error={errors.text?.message}
                onChange={(e) =>
                  setValue("text", e.target.value, { shouldValidate: true })
                }
              />

              <Group grow>
                <TextInput
                  label="Buton Başlığı"
                  placeholder="Örn: Başla"
                  required
                  {...register("buttonTitle")}
                  error={errors.buttonTitle?.message}
                  onChange={(e) =>
                    setValue("buttonTitle", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                />
                <TextInput
                  label="Buton Linki"
                  placeholder="Örn: /get-started"
                  required
                  {...register("buttonLink")}
                  error={errors.buttonLink?.message}
                  onChange={(e) =>
                    setValue("buttonLink", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                />
              </Group>

              <Group justify="flex-end" mt="md">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  leftSection={<AiOutlineEdit size={16} />}
                >
                  Güncelle
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </Stack>
  );
};

const HeroesEdit = ({ initialData }: { initialData?: Array<HeroData> }) => {
  if (!initialData?.length) {
    return <AddHeroForm />;
  }

  return <EditHeroForm initialData={initialData[0]} />;
};

export default HeroesEdit;
