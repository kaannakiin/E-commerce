"use client";
import { DeleteCategories } from "@/actions/admin/categories/delete-categories";
import SpecialPagination from "@/components/Pagination";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
const CategoryTable = ({ data, totalPages }) => {
  const [openModal, setOpenModal] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const onClickModal = (categorySlug) => {
    setOpenModal(true);
    setSelectedCategory(categorySlug);
  };
  const onSubmitDelete = async () => {
    try {
      setLoadingSubmit(true);
      await DeleteCategories(selectedCategory).then((res) => {
        if (res.success) {
          setOpenModal(false);
          router.refresh();
        }
        if (!res.success) {
          setErrorMessage(res.message);
        }
        setLoadingSubmit(false);
      });
    } catch (error) {
      console.error(error);
    }
  };
  const inputOnChange = useDebouncedCallback((e) => {
    const params = new URLSearchParams(searchParams);
    if (e) {
      params.set("search", e);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 800);

  return (
    <ScrollArea className="px-2">
      <div className="flex flex-row w-full items-center mt-2 mb-4 gap-4 ">
        <TextInput
          className="w-1/3 "
          placeholder="Kategori Adı"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            inputOnChange(e.currentTarget.value);
          }}
          defaultValue={searchParams.get("search")}
          rightSection={<IoSearchOutline size={20} className="text-gray-400" />}
        />
        <Button onClick={() => router.push("/admin/kategoriler/kategori-ekle")}>
          Kategori Ekle
        </Button>
      </div>
      <Table mb={40} miw={700} striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Kategori Adı</Table.Th>
            <Table.Th>Açıklama</Table.Th>
            <Table.Th>Ürünler</Table.Th>
            <Table.Th>Yayında</Table.Th>
            <Table.Th>İşlem</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((category) => (
            <Table.Tr key={category.slug}>
              <Table.Td>{category.name}</Table.Td>
              <Table.Td>{category.description}</Table.Td>
              <Table.Td>
                <Tooltip
                  multiline
                  w={150}
                  position="right"
                  label={category.products.map((p) => p.name).join("\n")}
                >
                  <Badge
                    size="lg"
                    variant="light"
                    color="blue"
                    className="cursor-pointer"
                  >
                    {category.products.length} Ürün
                  </Badge>
                </Tooltip>
              </Table.Td>
              <Table.Td>
                {category.active ? (
                  <Badge size="lg" variant="filled" color="green">
                    Aktif
                  </Badge>
                ) : (
                  <Badge size="lg" variant="filled" color="red">
                    Pasif
                  </Badge>
                )}
              </Table.Td>

              <Table.Td>
                <Group gap={"xs"}>
                  <Tooltip label="Düzenle" position="top">
                    <ActionIcon size="sm" color="blue" variant="light">
                      <FaEdit
                        size={16}
                        onClick={() =>
                          router.push(`/admin/kategoriler/${category.slug}`)
                        }
                      />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Sil" position="top">
                    <ActionIcon
                      size="sm"
                      color="red"
                      variant="light"
                      onClick={() => onClickModal(category.slug)}
                    >
                      <FaTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Modal
        opened={openModal}
        onClose={() => {
          setOpenModal(false);
          setErrorMessage("");
          setSelectedCategory(null);
        }}
        centered
        withCloseButton={false}
        size={"md"}
      >
        <Stack py={10}>
          <Text className="text-center" size="lg">
            Kategoriyi silmek istediğinize emin misiniz?
          </Text>
          {errorMessage && (
            <Text className=" text-center " size="sm" c="red">
              {errorMessage}
            </Text>
          )}
          <Group justify="center" mt="md">
            <Button
              variant="light"
              onClick={() => setOpenModal((prev) => !prev)}
            >
              İptal
            </Button>
            <Button
              color="red"
              onClick={onSubmitDelete}
              loading={loadingSubmit}
            >
              Onayla
            </Button>
          </Group>
        </Stack>
      </Modal>
      <SpecialPagination
        totalPages={totalPages}
        currentPage={parseInt(searchParams.get("page") as string, 10) || 1}
      />
    </ScrollArea>
  );
};

export default CategoryTable;
