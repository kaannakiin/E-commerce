"use client";
import { Group, rem, SimpleGrid, Text } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import "@mantine/dropzone/styles.css";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Control, useController } from "react-hook-form";
import { IoClose, IoCloudUpload, IoImage, IoVideocam } from "react-icons/io5";
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

interface CustomDropzoneProps {
  name: string;
  control: Control;
  maxFiles?: number;
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
  const MAX_FILE_SIZE = maxFiles * 10 * 1024 * 1024; // 50MB

  const [previews, setPreviews] = useState<
    { url: string; file: FileWithPath }[]
  >([]);
  const ACCEPTED_EXTENSIONS = {
    images: ["PNG", "JPG", "JPEG"],
    videos: ["MP4", "MOV", "AVI"],
  };
  const ACCEPTED_MIME_TYPES = videosEnabled
    ? [...IMAGE_TYPES, ...VIDEO_TYPES]
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
        if (isForce && (!files || files.length === 0))
          return "En az bir dosya seçmelisiniz";
        if (files && files.length > maxFiles)
          return `En fazla ${maxFiles} dosya seçilebilir`;
        return true;
      },
    },
  });

  useEffect(() => {
    // Mevcut URL'leri temizle
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));

    // Eğer value boşsa, previews'ı temizle
    if (!value || !Array.isArray(value) || value.length === 0) {
      setPreviews([]);
      return;
    }

    // Yeni preview'ları oluştur
    const newPreviews = value.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);

    // Cleanup
    return () => {
      newPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const removeFile = (fileToRemove: FileWithPath) => {
    const updatedFiles = value.filter(
      (file: FileWithPath) => file !== fileToRemove,
    );
    onChange(updatedFiles);
  };

  const isFileVideo = (file: File) => file.type.startsWith("video/");
  const isFileImage = (file: File) => file.type.startsWith("image/");

  return (
    <div>
      <Dropzone
        onDrop={(files) => {
          onChange([...(value || []), ...files]);
        }}
        maxSize={MAX_FILE_SIZE}
        maxFiles={maxFiles}
        accept={ACCEPTED_MIME_TYPES}
      >
        <Group
          justify="center"
          gap="xl"
          style={{ minHeight: rem(140), pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IoCloudUpload size={52} color="var(--mantine-color-blue-6)" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IoClose size={52} color="var(--mantine-color-red-6)" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <Group gap="md">
              <IoImage size={52} color="var(--mantine-color-gray-6)" />
              {videosEnabled && (
                <IoVideocam size={52} color="var(--mantine-color-gray-6)" />
              )}
            </Group>
          </Dropzone.Idle>

          <div>
            <Text size="sm" c="dimmed" inline mt={7}>
              {videosEnabled
                ? `Görseller (${ACCEPTED_EXTENSIONS.images.join(", ")}) ve videolar (${ACCEPTED_EXTENSIONS.videos.join(", ")}) kabul edilir.`
                : `Görseller (${ACCEPTED_EXTENSIONS.images.join(", ")}) kabul edilir.`}
              Maksimum {maxFiles * 10} MB. En fazla {maxFiles} dosya
              yüklenebilir
            </Text>
          </div>
        </Group>
      </Dropzone>

      {value?.length > 0 && (
        <Group gap="sm" mt="md">
          {value.map((file: FileWithPath, index: number) => (
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
        <SimpleGrid cols={3} spacing="md" verticalSpacing="md" mt="md">
          {previews.map((preview, index) => (
            <div
              key={index}
              style={{
                aspectRatio: "1",
                position: "relative",
                borderRadius: rem(4),
                overflow: "hidden",
                backgroundColor: "var(--mantine-color-gray-1)",
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
        </SimpleGrid>
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
