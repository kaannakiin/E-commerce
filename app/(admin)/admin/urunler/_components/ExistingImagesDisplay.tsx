import React from "react";
import { Group, ActionIcon, Text, Modal, Button, Stack } from "@mantine/core";
import { IoClose } from "react-icons/io5";
import { useState } from "react";
import CustomImage from "@/components/CustomImage";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { DeleteAsset } from "../_actions/ProductActions";
import { useRouter } from "next/navigation";

interface ExistingImagesDisplayProps {
  images: string[];
  onImageDeleted?: (deletedImageUrl: string) => void;
}

const ExistingImagesDisplay: React.FC<ExistingImagesDisplayProps> = ({
  images: initialImages,
  onImageDeleted,
}) => {
  const [images, setImages] = useState<string[]>(initialImages || []);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    imageUrl: null,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { refresh } = useRouter();
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    imageUrl: null,
  });
  if (!initialImages || initialImages.length === 0) {
    return null;
  }
  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, imageUrl: null });
    setErrorMessage(null);
    setIsLoading(false);
  };

  const handleDeleteClick = (imageUrl: string) => {
    setDeleteModal({
      isOpen: true,
      imageUrl,
    });
    setErrorMessage(null);
  };

  const handlePreviewClick = (imageUrl: string) => {
    setPreviewModal({
      isOpen: true,
      imageUrl,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.imageUrl) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // const res = await DeleteAsset(deleteModal.imageUrl, variantId);
      // if (res.success) {
      //   setImages((prevImages) =>
      //     prevImages.filter((img) => img !== deleteModal.imageUrl),
      //   );
      //   // Call the onImageDeleted callback with the deleted image URL
      //   onImageDeleted?.(deleteModal.imageUrl);
      //   handleCloseDeleteModal();
      //   refresh();
      // } else {
      //   setErrorMessage(res.message || "Resim silinirken bir hata oluştu");
      // }
    } catch (error) {
      setErrorMessage("Beklenmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div>
      <Text size="sm" fw={500} mb="xs">
        Mevcut Görseller ({images.length})
      </Text>
      <Group gap="md">
        {images.map((imageUrl) => (
          <div key={imageUrl} className="group relative">
            <div className="relative h-32 w-32 overflow-hidden rounded-lg shadow-md">
              <CustomImage
                src={imageUrl}
                alt="Variant image"
                objectFit="contain"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20">
                <div className="absolute bottom-1 right-1 flex gap-1">
                  <ActionIcon
                    className="backdrop-blur-[2px]"
                    color="dark"
                    variant="filled"
                    size="sm"
                    onClick={() => handlePreviewClick(imageUrl)}
                  >
                    <MdOutlineZoomOutMap size={16} className="text-white" />
                  </ActionIcon>
                  <ActionIcon
                    className="backdrop-blur-[2px]"
                    color="red"
                    variant="filled"
                    size="sm"
                    onClick={() => handleDeleteClick(imageUrl)}
                  >
                    <IoClose size={16} className="text-white" />
                  </ActionIcon>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Group>

      <Modal
        opened={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        title="Görsel Silme Onayı"
        centered
      >
        <Stack>
          <Text>Bu görseli silmek istediğinizden emin misiniz?</Text>
          {errorMessage && (
            <Text color="red" size="sm" className="animate-fade-in">
              {errorMessage}
            </Text>
          )}
          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              onClick={handleCloseDeleteModal}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button color="red" onClick={confirmDelete} loading={isLoading}>
              Sil
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, imageUrl: null })}
        size="xl"
        padding="xs"
        withCloseButton={false}
      >
        <div className="relative h-[80vh] w-full">
          {previewModal.imageUrl && (
            <CustomImage
              src={previewModal.imageUrl}
              alt="Variant image preview"
              objectFit="contain"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ExistingImagesDisplay;
