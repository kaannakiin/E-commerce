"use client";
import {
  FaqQuestionFormValues,
  FaqSectionFormValues,
  FaqSectionSchema,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  CloseButton,
  Divider,
  Grid,
  Group,
  Modal,
  Paper,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { CiCircleInfo } from "react-icons/ci";
import { IoAddCircleOutline, IoTrash } from "react-icons/io5";
import { MdDevices } from "react-icons/md";

import CustomImage from "@/components/CustomImage";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { FaEdit } from "react-icons/fa";
import CustomDropzone from "../../../urunler/_components/CustomDropzone";
import {
  FaqSectionAction,
  FaqSectionDeleteImage,
} from "../_actions/FaqActions";
import { FaqType } from "../page";
import FaqQuestionForm from "./FaqQuestionForm";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useRouter } from "next/navigation";
interface MainFaqFormProps {
  data?: FaqType | null;
}
const MainFaqForm = ({ data }: MainFaqFormProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FaqSectionFormValues>({
    resolver: zodResolver(FaqSectionSchema),
    defaultValues: {
      active: data?.isActive || true,
      description: data?.description || "",
      isFooter: data?.displaySettings?.isFooter || false,
      isHeader: data?.displaySettings?.isHeader || false,
      isMainPage: data?.displaySettings?.isMainPage || false,
      title: data?.title || "",
      questions:
        data?.questions.map((q) => {
          return { question: q.question, answer: q.answer, active: q.isActive };
        }) || [],
      imageFile: [],
    },
  });
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [opened, { open, close }] = useDisclosure(false);
  const [editModalOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [deleteImageModal, { open: openDeleteImage, close: closeDeleteImage }] =
    useDisclosure(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<FaqQuestionFormValues | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);

  const questions = watch("questions") || [];
  const { refresh } = useRouter();
  const handleAddQuestion = (data: FaqQuestionFormValues) => {
    const updatedQuestions = [...questions, data];
    setValue("questions", updatedQuestions);
    close();
  };

  const handleEditQuestion = (data: FaqQuestionFormValues) => {
    if (!selectedQuestion) return;

    const updatedQuestions = questions.map((q, index) =>
      index === selectedQuestionIndex ? { ...data } : q,
    );
    setValue("questions", updatedQuestions);
    closeEdit();
    setSelectedQuestion(null);
    setSelectedQuestionIndex(null);
  };

  const startEdit = (question: FaqQuestionFormValues, index: number) => {
    setSelectedQuestion(question);
    setSelectedQuestionIndex(index);
    openEdit();
  };
  const onSubmit: SubmitHandler<FaqSectionFormValues> = async (data) => {
    await FaqSectionAction(data).then((res) => {
      if (res.success) {
        setDialogState((prev) => ({
          ...prev,
          isOpen: true,
          message: res.message,
          type: "success",
        }));
      } else {
        setDialogState((prev) => ({
          ...prev,
          isOpen: true,
          message: res.message,
          type: "error",
        }));
      }
      refresh();
    });
  };
  const handleOnImageClick = async () => {
    try {
      await FaqSectionDeleteImage(data?.image?.url, data?.id).then((res) => {
        if (res.success) {
          setDialogState((prev) => ({
            ...prev,
            isOpen: true,
            message: res.message,
            type: "success",
          }));
        } else {
          setDialogState((prev) => ({
            ...prev,
            isOpen: true,
            message: res.message,
            type: "error",
          }));
        }
        refresh();
        closeDeleteImage();
      });
    } catch (error) {}
  };
  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="lg">
          <Card padding="md" radius="md" withBorder>
            <Group justify="apart">
              <Group>
                <Title order={3}>SSS Yönetimi</Title>
              </Group>
              <Button
                leftSection={<MdDevices />}
                type="submit"
                loading={isSubmitting}
                size="md"
              >
                Değişiklikleri Kaydet
              </Button>
            </Group>
          </Card>

          <Card padding="xl" radius="md" withBorder>
            <Stack gap="xl">
              <Paper p="md" radius="md" bg="gray.0" className="w-full lg:w-1/2">
                <Stack gap="md">
                  <Group justify="space-between" align="start">
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={500} color="gray.7">
                        SSS Durumu
                      </Text>
                      <Text size="xs" color="gray.6" lineClamp={4}>
                        Sıkça sorulan sorular bölümünü aktif veya pasif yapın.
                        Eğer akitfse Sıkça Sorulan Sorular
                        /sikca-sorulan-sorular slugı altında gösterilecektir.
                        Eğer aktif değilse böyle bir seçeneğinizin sitenizde
                        bulunmayacaktır.
                      </Text>
                    </Box>
                    <Box className="ml-4">
                      <Controller
                        control={control}
                        name="active"
                        render={({ field: { value, onChange, ...field } }) => (
                          <Switch
                            size="md"
                            onLabel="ON"
                            offLabel="OFF"
                            checked={value}
                            onChange={(event) =>
                              onChange(event.currentTarget.checked)
                            }
                            {...field}
                          />
                        )}
                      />
                    </Box>
                  </Group>

                  <Group justify="space-between">
                    <Box>
                      <Text size="sm" fw={500} color="gray.7">
                        Footer Görünürlüğü
                      </Text>
                      <Text size="xs" color="gray.6">
                        SSS bölümünün footer alanında görünürlüğünü yönetin
                      </Text>
                    </Box>
                    <Controller
                      control={control}
                      name="isFooter"
                      render={({ field: { value, onChange, ...field } }) => (
                        <Switch
                          size="md"
                          onLabel="ON"
                          offLabel="OFF"
                          checked={value}
                          onChange={(event) =>
                            onChange(event.currentTarget.checked)
                          }
                          {...field}
                        />
                      )}
                    />
                  </Group>

                  <Group justify="space-between">
                    <Box>
                      <Text size="sm" fw={500} color="gray.7">
                        Header Görünürlüğü
                      </Text>
                      <Text size="xs" color="gray.6">
                        SSS bölümünün header alanında görünürlüğünü yönetin
                      </Text>
                    </Box>
                    <Controller
                      control={control}
                      name="isHeader"
                      render={({ field: { value, onChange, ...field } }) => (
                        <Switch
                          size="md"
                          onLabel="ON"
                          offLabel="OFF"
                          checked={value}
                          onChange={(event) =>
                            onChange(event.currentTarget.checked)
                          }
                          {...field}
                        />
                      )}
                    />
                  </Group>

                  <Group justify="space-between">
                    <Box>
                      <Text size="sm" fw={500} color="gray.7">
                        Ana Sayfa Görünürlüğü
                      </Text>
                      <Text size="xs" color="gray.6">
                        SSS bölümünün ana sayfada görünürlüğünü yönetin
                      </Text>
                    </Box>
                    <Controller
                      control={control}
                      name="isMainPage"
                      render={({ field: { value, onChange, ...field } }) => (
                        <Switch
                          size="md"
                          onLabel="ON"
                          offLabel="OFF"
                          checked={value}
                          onChange={(event) =>
                            onChange(event.currentTarget.checked)
                          }
                          {...field}
                        />
                      )}
                    />
                  </Group>
                </Stack>
              </Paper>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={open}
                  leftSection={<IoAddCircleOutline size={20} />}
                >
                  Soru Ekle
                </Button>
              </div>
              <Divider label="SSS İçeriği" labelPosition="center" />
              {errors.questions?.message && (
                <Text c={"red"}>{errors.questions?.message}</Text>
              )}
              <Grid gutter={{ base: "sm", sm: "md", lg: "lg" }}>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  {data?.image?.url ? (
                    <Stack className="relative h-40 w-full lg:h-full">
                      <ActionIcon
                        onClick={openDeleteImage}
                        variant="transparent"
                        className="self-end"
                      >
                        <CloseButton />
                      </ActionIcon>
                      <CustomImage src={data?.image?.url} quality={40} />
                    </Stack>
                  ) : (
                    <Stack>
                      <Text size="sm" fw={500}>
                        SSS Görseli
                      </Text>
                      <CustomDropzone
                        control={control}
                        name="imageFile"
                        maxFiles={1}
                      />
                      {errors.imageFile && (
                        <Text size="xs" color="red">
                          {errors.imageFile.message}
                        </Text>
                      )}
                    </Stack>
                  )}
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Stack gap="sm">
                    <Controller
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          label="Başlık"
                          withAsterisk
                          placeholder="SSS bölümü için başlık girin"
                          description="Ana sayfada görünecek başlık"
                          error={errors.title?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Açıklama"
                          withAsterisk
                          placeholder="SSS bölümü için açıklama girin"
                          description="Başlığın altında görünecek açıklama metni"
                          error={errors.description?.message}
                        />
                      )}
                    />
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        </Stack>
      </form>
      {questions.length > 0 && (
        <Card padding="xl" radius="md" withBorder className="mt-4">
          <Stack gap="md">
            <Title order={4}>Eklenen Sorular</Title>
            {questions.map((question, index) => (
              <Paper key={index} p="md" withBorder>
                <Group justify="start" mb={2}>
                  <Text fw={500}>{question.question}</Text>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => startEdit(question, index)}
                  >
                    <FaEdit size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Card>
      )}
      <div>
        <Modal
          opened={opened}
          onClose={close}
          size={"xl"}
          title="Soru Ekle"
          overlayProps={{
            backgroundOpacity: 0.4,
            blur: "3",
          }}
        >
          <FaqQuestionForm onSubmit={handleAddQuestion} onClose={close} />
        </Modal>
        <Modal
          opened={editModalOpened}
          size={"xl"}
          onClose={() => {
            closeEdit();
            setSelectedQuestion(null);
          }}
          title="Soruyu Düzenle"
          overlayProps={{
            backgroundOpacity: 0.4,
            blur: "3",
          }}
        >
          <FaqQuestionForm
            onSubmit={handleEditQuestion}
            onClose={closeEdit}
            defaultValues={selectedQuestion}
          />
        </Modal>
        <Modal
          opened={deleteImageModal}
          onClose={closeDeleteImage}
          title="Görsel Silme Onayı"
          centered
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Görseli silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeDeleteImage}>
                İptal
              </Button>
              <Button
                color="red"
                onClick={handleOnImageClick}
                leftSection={<IoTrash size={16} />}
              >
                Görseli Sil
              </Button>
            </Group>
          </Stack>
        </Modal>
      </div>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </div>
  );
};

export default MainFaqForm;
