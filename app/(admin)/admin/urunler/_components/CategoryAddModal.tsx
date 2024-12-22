"use client";
import { Alert, Button, Modal, Paper } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IoAddCircleOutline, IoWarningOutline } from "react-icons/io5";
import EditableCategoryForm from "../../kategoriler/_components/CategoryForm";
import { useEffect, useState } from "react";
import { getGoogleCategories } from "../_actions/ProductActions";
import { googleType } from "../urun-ekle/page";
import { useRouter } from "next/navigation";

type Props = {
  extraCategory?: boolean;
};

const CategoryAddModal = ({ extraCategory = false }: Props) => {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [googleCategories, setGoogleCategories] = useState<googleType[] | null>(
    null,
  );
  const { refresh } = useRouter();
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getGoogleCategories();
      if (response.success) {
        setGoogleCategories(response.data);
      }
    };

    if (opened) {
      fetchCategories();
    }
  }, [opened]);

  return (
    <Paper
      shadow={extraCategory ? "" : "sm"}
      p={extraCategory ? "" : "md"}
      className={extraCategory ? "" : "bg-gray-50"}
    >
      {!extraCategory && (
        <Alert
          icon={<IoWarningOutline size={24} />}
          title="Kategori Gerekli"
          color="orange"
          variant="light"
          className="mb-4"
        >
          Ürün ekleyebilmek için en az bir kategori tanımlamanız gerekmektedir.
        </Alert>
      )}

      <div className={extraCategory ? "my-4" : "flex justify-end"}>
        <Button
          onClick={toggle}
          leftSection={<IoAddCircleOutline size={20} />}
          color="primary.7"
          variant="filled"
        >
          Yeni Kategori Ekle
        </Button>
      </div>

      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        size="xl"
        title="Yeni Kategori Ekle"
      >
        <EditableCategoryForm
          onClosed={() => {
            close();
            refresh();
          }}
          googleCategories={googleCategories}
        />
      </Modal>
    </Paper>
  );
};

export default CategoryAddModal;
