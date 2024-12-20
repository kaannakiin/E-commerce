import React from "react";
import { Button, Modal, Paper, Alert } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IoWarningOutline } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";
import AddCategoryForm from "../../_components/AddCategory";
import { useRouter } from "next/navigation";

const CategoryAddModal = () => {
  const [opened, { toggle, close }] = useDisclosure(false);
  const { refresh } = useRouter();
  return (
    <Paper shadow="sm" p="md" className="bg-gray-50">
      <Alert
        icon={<IoWarningOutline size={24} />}
        title="Kategori Gerekli"
        color="orange"
        variant="light"
        className="mb-4"
      >
        Ürün ekleyebilmek için en az bir kategori tanımlamanız gerekmektedir.
      </Alert>

      <div className="flex justify-end">
        <Button
          onClick={toggle}
          leftSection={<IoAddCircleOutline size={20} />}
          color="blue"
          variant="filled"
        >
          Yeni Kategori Ekle
        </Button>
      </div>

      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        size="md"
        title="Yeni Kategori Ekle"
      >
        <AddCategoryForm
          onClose={() => {
            close();
            refresh();
          }}
        />
      </Modal>
    </Paper>
  );
};

export default CategoryAddModal;
