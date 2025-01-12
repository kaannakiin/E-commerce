import CustomImage from "@/components/CustomImage";
import { Modal, Button, Group, Text, CloseButton } from "@mantine/core";
import { useState } from "react";
import { DeleteImageOnCategory } from "../_actions/CategoryAction";

interface ImageDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ImageDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
}: ImageDeleteModalProps) => {
  return (
    <Modal opened={isOpen} onClose={onClose} title="Resmi Sil" centered>
      <Text size="sm" mb="lg">
        Bu resmi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
      </Text>
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose}>
          İptal
        </Button>
        <Button color="red" onClick={onConfirm}>
          Sil
        </Button>
      </Group>
    </Modal>
  );
};

const ImageWithDelete = ({ src, slug, onDeleteSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await DeleteImageOnCategory(src, slug);
      if (response.success) {
        onDeleteSuccess();
      } else {
      }
    } catch (error) {
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  const handleModalOpen = (e: React.MouseEvent) => {
    e.preventDefault(); // Form submit'i engelle
    e.stopPropagation(); // Event bubbling'i engelle
    setIsModalOpen(true);
  };

  return (
    <div className="group relative h-40 w-full">
      <button
        type="button"
        onClick={handleModalOpen}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white opacity-100 shadow-md transition-opacity md:opacity-0 md:group-hover:opacity-100"
        disabled={isDeleting}
      >
        <CloseButton />
      </button>
      <CustomImage
        src={src}
        objectFit="contain"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, 100vw"
        quality={20}
      />
      <ImageDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ImageWithDelete;
