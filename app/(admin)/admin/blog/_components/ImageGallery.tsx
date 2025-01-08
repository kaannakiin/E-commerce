"use client";
import MainLoader from "@/components/MainLoader";
import { useImages } from "@/context/ImageContext";
import { RecordAssetForRichText } from "@/lib/RichTextRecordAsset";
import { Group, Modal, rem, Text } from "@mantine/core";
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import "@mantine/dropzone/styles.css";
import { useDisclosure } from "@mantine/hooks";
import { Fragment, useState } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";
import { IoCloudUploadOutline, IoImageOutline } from "react-icons/io5";
import { LiaTimesSolid } from "react-icons/lia";
import GalleryImage from "./GalleryImage";
import { DeleteImageForRichText } from "../_actions/BlogAction";

interface ImageGalleryProps extends Partial<DropzoneProps> {
  onImageSelect?: (imageSrc: string) => void;
}

const ImageGallery = ({ onImageSelect, ...props }: ImageGalleryProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const image = useImages();
  const images = image?.images;
  const updateImages = image?.updateImages;
  const removeOldImage = image?.removeOldImage;
  const [loading, setLoading] = useState(false);
  const onDrop = async (data) => {
    try {
      setLoading(true);
      const res = await RecordAssetForRichText(data.imageFiles[0]);
      if (res.success) {
        updateImages([res.secureUrl, ...images]);
      }
    } catch (error) {
      console.error("Resim yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = (item: string) => {
    if (onImageSelect) {
      onImageSelect(item);
      close();
    }
  };

  const handleDelete = async (imageUrl: string) => {
    if (updateImages && images) {
      const urlParams = new URLSearchParams(new URL(imageUrl).search);
      const url = urlParams.get("url");
      if (url) {
        try {
          const res = await DeleteImageForRichText(url);
          if (res.success) {
            if (removeOldImage) {
              removeOldImage(imageUrl);
            }
          }
        } catch (error) {
          console.error("Resim silme hatası:", error);
        }
      }
    }
  };
  return (
    <Fragment>
      <IoImageOutline size={"1rem"} onClick={open} />

      <Modal
        opened={opened}
        size={"55rem"}
        onClose={close}
        withCloseButton={false}
        centered
        overlayProps={{
          backgroundOpacity: 0.3,
          blur: 3,
        }}
      >
        {loading && <MainLoader type="oval" />}
        <div className="h-full min-h-full w-full min-w-full p-4">
          <Dropzone
            onDrop={(files) => onDrop({ imageFiles: files })}
            maxSize={10 * 1024 * 1024}
            maxFiles={1}
            accept={IMAGE_MIME_TYPE}
            {...props}
          >
            <Group
              justify="center"
              gap="xl"
              mih={220}
              style={{ pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <IoCloudUploadOutline
                  style={{
                    width: rem(52),
                    height: rem(52),
                    color: "var(--mantine-color-blue-6)",
                  }}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <LiaTimesSolid
                  style={{
                    width: rem(52),
                    height: rem(52),
                    color: "var(--mantine-color-red-6)",
                  }}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <HiOutlinePhoto
                  style={{
                    width: rem(52),
                    height: rem(52),
                    color: "var(--mantine-color-dimmed)",
                  }}
                />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Resimleri buraya sürükleyin veya dosya seçmek için tıklayın
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  İstediğiniz kadar dosya ekleyebilirsiniz, her dosya 5mb&apos;ı
                  geçmemelidir
                </Text>
              </div>
            </Group>
          </Dropzone>
          {!images?.length && (
            <div className="p-4 text-center">Resim Bulunamadı</div>
          )}
          <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-4">
            {images?.map((image, index) => (
              <GalleryImage
                key={index}
                src={image}
                onSelectClick={() => handleSelection(image)}
                onDeleteClick={() => handleDelete(image)}
              />
            ))}
          </div>
        </div>
      </Modal>
    </Fragment>
  );
};

export default ImageGallery;
