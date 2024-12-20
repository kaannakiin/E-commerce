"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Grid,
  Group,
  Paper,
  Progress,
  rem,
  Stack,
  Text,
} from "@mantine/core";
import { Dropzone, FileRejection, FileWithPath } from "@mantine/dropzone";
import { useHover } from "@mantine/hooks";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";
import { FaImage, FaTrash } from "react-icons/fa";
import { TbAlertCircle, TbDragDrop2, TbX } from "react-icons/tb";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
];

interface ImageDropzoneProps<T extends FieldValues> {
  name: Path<T>;
  setValue: UseFormSetValue<T>;
  trigger: UseFormTrigger<T>;
  value?: File[];
  maxFiles?: number;
  error?: string;
  required?: boolean;
  isNotMultiple?: boolean;
}

const ImageDropzone = <T extends FieldValues>({
  name,
  setValue,
  trigger,
  value = [],
  maxFiles = 10,
  error,
  required = false,
  isNotMultiple = false,
}: ImageDropzoneProps<T>) => {
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const openRef = useRef<(() => void) | null>(null);
  const { hovered, ref } = useHover();

  const getErrorMessage = (rejection: FileRejection) => {
    if (rejection.file.size > MAX_FILE_SIZE) {
      return `${rejection.file.name} boyutu çok büyük. Maksimum dosya boyutu: 10MB`;
    }
    if (!SUPPORTED_FORMATS.includes(rejection.file.type)) {
      return `${rejection.file.name} desteklenmeyen dosya türü. Kabul edilen türler: JPEG, PNG, WEBP`;
    }
    return `${rejection.file.name} yüklenemedi: ${
      rejection.errors[0]?.message || "Bilinmeyen hata"
    }`;
  };

  const handleReject = (rejections: FileRejection[]) => {
    const errors = rejections.map(getErrorMessage);
    setFileErrors(errors);
    setTimeout(() => setFileErrors([]), 3000);
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

  const validateAndUpdateFiles = (files: File[]) => {
    let isValid = true;
    const errors: string[] = [];

    if (files.length > maxFiles) {
      errors.push(`Maksimum ${maxFiles} dosya yükleyebilirsiniz`);
      isValid = false;
    }

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} dosya boyutu 10MB'dan küçük olmalıdır`);
        isValid = false;
      }

      if (!SUPPORTED_FORMATS.includes(file.type)) {
        errors.push(
          `${file.name} geçersiz dosya formatı. Desteklenen formatlar: .jpg, .jpeg, .png, .webp`,
        );
        isValid = false;
      }
    });

    if (!isValid) {
      setFileErrors(errors);
      setTimeout(() => setFileErrors([]), 3000);
      return false;
    }

    return true;
  };

  const handleDrop = (droppedFiles: FileWithPath[]) => {
    const allFiles = [...value, ...droppedFiles];

    if (!validateAndUpdateFiles(allFiles)) return;

    const newUploadingFiles = new Set(uploadingFiles);
    droppedFiles.forEach((file) => {
      newUploadingFiles.add(file.name);
      simulateUpload(file);
    });
    setUploadingFiles(newUploadingFiles);

    setValue(name, allFiles as PathValue<T, Path<T>>, { shouldValidate: true });
  };

  const handleFileDelete = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    setValue(name, newFiles as PathValue<T, Path<T>>, { shouldValidate: true });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...value];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    setValue(name, newFiles as PathValue<T, Path<T>>, { shouldValidate: true });
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

  return (
    <Stack>
      <Dropzone
        onDrop={handleDrop}
        onReject={handleReject}
        maxSize={MAX_FILE_SIZE}
        accept={SUPPORTED_FORMATS}
        openRef={openRef}
        multiple={!isNotMultiple}
        activateOnClick={false}
        classNames={{
          root: `border-2 border-dashed border-gray-300 rounded-lg p-2 ${
            error ? "border-red-500" : ""
          }`,
        }}
      >
        <Group align="center" justify="center" style={{ minHeight: rem(100) }}>
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
            {required && (
              <Text size="xs" color="red">
                * Zorunlu alan
              </Text>
            )}
          </Stack>
        </Group>
      </Dropzone>

      {(fileErrors.length > 0 || error) && (
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
          {error && <Text size="sm">{error}</Text>}
        </Alert>
      )}

      {value?.length > 0 && (
        <Paper p="md" withBorder>
          <Grid>
            {value.map((file, index) => (
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
                    {file.type === "video/mp4" ? (
                      // Video preview için
                      <video
                        src={URL.createObjectURL(file)}
                        className="h-full w-full rounded object-contain"
                        controls // Kontrol butonlarını göster
                        muted // Sessiz başlat
                        loop // Döngüye al
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      // Resim preview için
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        fill
                        className="h-full w-full rounded object-contain"
                      />
                    )}
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
    </Stack>
  );
};

export default ImageDropzone;
