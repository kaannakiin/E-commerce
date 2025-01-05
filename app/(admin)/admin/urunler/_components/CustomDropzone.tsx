"use client";
import React, { useEffect, useState } from "react";
import { Group, Text, rem } from "@mantine/core";
import { useDropzone } from "react-dropzone";
import { useController, Control } from "react-hook-form";
import { IoCloudUpload, IoClose, IoVideocam, IoImage } from "react-icons/io5";
import Image from "next/image";

// Video uzantılarını ayrı tanımlayalım
const VIDEO_TYPES = {
  "video/*": [".mp4", ".mov", ".avi"],
};

const IMAGE_TYPES = {
  "image/*": [".png", ".jpg", ".jpeg"],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
interface CustomDropzoneProps {
  name: string;
  control: Control;
  maxFiles: number;
  videosEnabled?: boolean;
  isForce?: boolean;
}

const CustomDropzone: React.FC<CustomDropzoneProps> = ({
  name,
  control,
  maxFiles = 5,
  videosEnabled = false,
  isForce = true,
}) => {
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);

  const ACCEPTED_FILE_TYPES = videosEnabled
    ? { ...IMAGE_TYPES, ...VIDEO_TYPES }
    : IMAGE_TYPES;

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: [],
    rules: {
      validate: (files) => {
        if (isForce && files.length === 0)
          return "En az bir dosya seçmelisiniz";
        if (files.length > maxFiles)
          return `En fazla ${maxFiles} dosya seçilebilir`;
        return true;
      },
    },
  });
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: ACCEPTED_FILE_TYPES,
      maxSize: MAX_FILE_SIZE,
      maxFiles,
      onDrop: (accepted) => {
        onChange([...(value || []), ...accepted]);
      },
    });

  // Preview URL'lerini oluştur
  useEffect(() => {
    if (!value) return;

    const newPreviews = value.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [value]);

  // Komponent unmount olduğunda tüm URL'leri temizle
  useEffect(() => {
    return () => {
      setPreviews((prev) => {
        prev.forEach((preview) => URL.revokeObjectURL(preview.url));
        return [];
      });
    };
  }, []);
  useEffect(() => {
    if (!value || !Array.isArray(value) || value.length === 0) return;

    const newPreviews = value.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [value]);
  const removeFile = (fileToRemove: File) => {
    const updatedFiles = value.filter((file: File) => file !== fileToRemove);
    onChange(updatedFiles);
  };

  const isFileVideo = (file: File) => file.type.startsWith("video/");
  const isFileImage = (file: File) => file.type.startsWith("image/");

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${
            isDragActive
              ? "var(--mantine-color-blue-6)"
              : isDragReject
                ? "var(--mantine-color-red-6)"
                : error
                  ? "var(--mantine-color-red-6)"
                  : "var(--mantine-color-gray-4)"
          }`,
          padding: rem(20),
          borderRadius: rem(8),
          cursor: "pointer",
          backgroundColor: isDragActive
            ? "var(--mantine-color-blue-0)"
            : isDragReject
              ? "var(--mantine-color-red-0)"
              : "transparent",
        }}
      >
        <input {...getInputProps()} />

        <Group justify="center" gap="xl" style={{ minHeight: rem(140) }}>
          {isDragActive ? (
            <IoCloudUpload size={52} color="var(--mantine-color-blue-6)" />
          ) : isDragReject ? (
            <IoClose size={52} color="var(--mantine-color-red-6)" />
          ) : (
            <Group gap="md">
              <IoImage size={52} color="var(--mantine-color-gray-6)" />
              {videosEnabled && (
                <IoVideocam size={52} color="var(--mantine-color-gray-6)" />
              )}
            </Group>
          )}

          <div>
            <Text size="xl" inline>
              Dosyaları buraya sürükleyip bırakın veya seçmek için tıklayın
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              {videosEnabled
                ? `Görseller (PNG, JPG, JPEG) ve videolar (MP4, MOV, AVI) kabul edilir.`
                : `Görseller (PNG, JPG, JPEG) kabul edilir.`}
              Maksimum 50MB. En fazla {maxFiles} dosya yüklenebilir
            </Text>
          </div>
        </Group>
      </div>

      {value?.length > 0 && (
        <Group gap="sm" mt="md">
          {value.map((file: File, index: number) => (
            <div
              key={index}
              style={{
                padding: rem(8),
                backgroundColor: "var(--mantine-color-gray-0)",
                borderRadius: rem(4),
                display: "flex",
                alignItems: "center",
                gap: rem(8),
              }}
            >
              {isFileVideo(file) ? (
                <IoVideocam size={20} color="var(--mantine-color-blue-6)" />
              ) : (
                <IoImage size={20} color="var(--mantine-color-blue-6)" />
              )}
              <Text size="sm" truncate style={{ maxWidth: rem(200) }}>
                {file.name}
              </Text>
              <Text size="xs" c="dimmed">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </Text>
              <IoClose
                size={20}
                style={{ cursor: "pointer" }}
                color="var(--mantine-color-gray-6)"
                onClick={() => removeFile(file)}
              />
            </div>
          ))}
        </Group>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <Group gap="sm" mt="md">
          {previews.map((preview, index) => (
            <div
              key={index}
              style={{
                width: rem(200),
                height: rem(200),
                position: "relative",
                borderRadius: rem(4),
                overflow: "hidden",
              }}
            >
              {isFileImage(preview.file) ? (
                <Image
                  src={preview.url}
                  alt={preview.file.name}
                  fill
                  unoptimized
                  style={{
                    objectFit: "contain",
                  }}
                />
              ) : isFileVideo(preview.file) && videosEnabled ? (
                <video
                  src={preview.url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  controls
                />
              ) : null}
            </div>
          ))}
        </Group>
      )}

      {error && (
        <Text color="red" size="sm" mt="xs">
          {error.message}
        </Text>
      )}
    </div>
  );
};

export default CustomDropzone;
