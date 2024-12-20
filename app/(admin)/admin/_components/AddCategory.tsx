"use client";
import { AddCategory } from "@/actions/admin/categories/add-category";
import FeedbackDialog from "@/components/FeedbackDialog";
import {
  AddCategorySchema,
  AddCategorySchemaType,
} from "@/zodschemas/authschema";
import { zodResolver } from "@hookform/resolvers/zod";
import "@mantine/carousel/styles.css";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Paper,
  Progress,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  rem,
} from "@mantine/core";
import { Dropzone, FileRejection, FileWithPath } from "@mantine/dropzone";
import { useHover } from "@mantine/hooks";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaImage, FaTrash } from "react-icons/fa";
import { TbAlertCircle, TbDragDrop2, TbX } from "react-icons/tb";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const AddCategoryForm = ({ onClose }: { onClose?: () => void }) => {
  const [fileInputValue, setFileInputValue] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const openRef = useRef<() => void>(null);
  const { hovered, ref } = useHover();
  const pathname = usePathname();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(AddCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
      imageFile: [],
      products: [],
    },
    mode: "onChange",
  });

  const watchImageFile = watch("imageFile");

  const getErrorMessage = (rejection: FileRejection) => {
    if (rejection.file.size > MAX_FILE_SIZE) {
      return `${rejection.file.name} boyutu çok büyük. Maksimum dosya boyutu: 10MB`;
    }
    if (!ACCEPTED_TYPES.includes(rejection.file.type)) {
      return `${rejection.file.name} desteklenmeyen dosya türü. Kabul edilen türler: JPEG, PNG, WEBP`;
    }
    return `${rejection.file.name} yüklenemedi: ${
      rejection.errors[0]?.message || "Bilinmeyen hata"
    }`;
  };

  const handleReject = (rejections: FileRejection[]) => {
    const errors = rejections.map(getErrorMessage);
    setFileErrors(errors);

    setTimeout(() => {
      setFileErrors([]);
    }, 3000);
  };

  const simulateUpload = (file: File) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
      }
      setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
    }, 100);
  };

  const handleFileChange = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValidSize = file.size <= MAX_FILE_SIZE;
      const isValidType = ACCEPTED_TYPES.includes(file.type);
      return isValidSize && isValidType;
    });

    const existingFileNames = new Set(fileInputValue.map((f) => f.name));
    const newFiles = validFiles.filter(
      (file) => !existingFileNames.has(file.name),
    );

    const newUploadingFiles = new Set(uploadingFiles);
    newFiles.forEach((file) => {
      newUploadingFiles.add(file.name);
      simulateUpload(file);
    });
    setUploadingFiles(newUploadingFiles);

    const allFiles = [...fileInputValue, ...validFiles];
    setFileInputValue(allFiles);
    setValue("imageFile", allFiles);
    trigger();
  };

  const handleDrop = (droppedFiles: FileWithPath[]) => {
    handleFileChange(droppedFiles);
  };

  const handleFileDelete = (index: number) => {
    const newFiles = Array.from(watchImageFile).filter((_, i) => i !== index);
    setFileInputValue(newFiles);
    setValue("imageFile", newFiles);
    trigger();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null) return;
    if (draggedIndex === index) return;

    const newFiles = [...fileInputValue];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    setFileInputValue(newFiles);
    setValue("imageFile", newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onSubmit: SubmitHandler<AddCategorySchemaType> = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("active", data.active.toString());
    data.imageFile.forEach((file) => {
      formData.append("imageFile", file);
    });

    try {
      const res = await AddCategory(formData);
      if (res.success) {
        setDialogState({
          isOpen: true,
          message: res.message,
          type: "success",
        });
        reset();
        if (pathname === "/admin/urunler/urun-ekle") {
          onClose();
        } else {
          router.push("/admin/kategoriler");
        }
      } else {
        if (pathname === "/admin/urunler/urun-ekle") {
          setError("root", { message: res.message });
        } else {
          setDialogState({
            isOpen: true,
            message: res.message,
            type: "error",
          });
        }
      }
    } catch (error) {
      setDialogState({
        isOpen: true,
        message:
          error instanceof Error
            ? error.message
            : "Beklenmeyen bir hata oluştu",
        type: "error",
      });
    }
  };

  return (
    <Card
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      className="mx-auto max-w-2xl"
    >
      <Card.Section p="md" withBorder inheritPadding>
        <Text size="xl" fw={700}>
          Yeni Kategori Ekle
        </Text>
      </Card.Section>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack mt="md">
          <TextInput
            {...register("name")}
            label="Kategori Adı"
            placeholder="Kategori adını giriniz"
            error={errors.name?.message}
            required
          />

          <Textarea
            {...register("description")}
            label="Açıklama"
            placeholder="Kategori açıklamasını giriniz"
            error={errors.description?.message}
            minRows={3}
            required
          />

          <Dropzone
            onDrop={handleDrop}
            onReject={handleReject}
            maxSize={MAX_FILE_SIZE}
            accept={ACCEPTED_TYPES}
            openRef={openRef}
            activateOnClick={false}
            classNames={{
              root: "border-2 border-dashed border-gray-300 rounded-lg p-2",
            }}
          >
            <Group
              align="center"
              justify="center"
              style={{ minHeight: rem(100) }}
            >
              <Dropzone.Accept>
                <TbDragDrop2 size={32} color="teal" />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <TbX size={32} color="red" />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <FaImage size={32} color="gray" />
              </Dropzone.Idle>
              <Stack align="center">
                <Text size="sm">Görselleri sürükleyip bırakın veya</Text>
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => openRef.current?.()}
                  mt={5}
                >
                  Dosya Seçin
                </Button>
                <Text size="xs" color="dimmed" mt={5}>
                  Maksimum dosya boyutu: 10MB
                </Text>
              </Stack>
            </Group>
          </Dropzone>
          {fileErrors.length > 0 && (
            <Alert
              icon={<TbAlertCircle size="1rem" />}
              title="Dosya Yükleme Hatası"
              color="red"
              variant="light"
            >
              {fileErrors.map((error, index) => (
                <Text
                  key={index}
                  size="sm"
                  mb={index !== fileErrors.length - 1 ? 2 : 0}
                >
                  {error}
                </Text>
              ))}
            </Alert>
          )}
          {watchImageFile?.length > 0 && (
            <Paper p="md" withBorder>
              <Grid>
                {Array.from(watchImageFile).map((file, index) => (
                  <Grid.Col key={index} span={4}>
                    <Paper
                      p="xs"
                      withBorder
                      ref={ref}
                      style={{
                        cursor: "move",
                        opacity: draggedIndex === index ? 0.5 : 1,
                      }}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={() => handleDragOver(index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          fill
                          className="h-full w-full rounded object-contain"
                        />
                        <ActionIcon
                          color="red"
                          variant="filled"
                          size="sm"
                          className="absolute right-1 top-1"
                          onClick={() => handleFileDelete(index)}
                        >
                          <FaTrash size={12} />
                        </ActionIcon>
                        <Badge className="absolute bottom-1 left-1" size="sm">
                          {getFileSize(file.size)}
                        </Badge>
                      </div>
                      {uploadingFiles.has(file.name) && (
                        <Progress
                          value={uploadProgress[file.name] || 0}
                          size="xs"
                          mt={4}
                          color="teal"
                          striped
                          animated
                        />
                      )}
                    </Paper>
                  </Grid.Col>
                ))}
              </Grid>
            </Paper>
          )}

          <Group>
            <Text size="sm">Kategori Durumu</Text>
            <Switch {...register("active")} label="Aktif" defaultChecked />
          </Group>
          {errors.root && (
            <Text size="sm" c={"red"}>
              {errors.root.message}
            </Text>
          )}
          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            disabled={!isValid}
            mt="md"
          >
            Kategori Ekle
          </Button>
        </Stack>
      </form>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        message={dialogState.message}
        type={dialogState.type}
      />
    </Card>
  );
};

export default AddCategoryForm;
