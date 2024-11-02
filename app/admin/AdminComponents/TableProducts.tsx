"use client";
import {
  Button,
  Checkbox,
  ColorSwatch,
  Menu,
  Pagination,
  ScrollArea,
  Table,
  TextInput,
  Tooltip,
  UnstyledButton,
  Modal,
} from "@mantine/core";
import {
  BiTime,
  BiHistory,
  BiSortUp,
  BiSortDown,
  BiSort,
  BiEdit,
  BiTrash,
} from "react-icons/bi";
import { FaSearch } from "react-icons/fa";
import { VariantType } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { DeleteProduct } from "@/actions/admin/products/delete-product/DeleteProduct";

const PriceDisplay = ({ price, discount }) => {
  if (discount > 0) {
    const discountedPrice = price - (discount * price) / 100;
    return (
      <div className="flex flex-col">
        <span className="text-red-600 font-semibold">
          {discountedPrice.toFixed(2)} TL
          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded ml-2">
            %{discount} İndirim
          </span>
        </span>
        <span className="text-gray-500 text-sm line-through">
          {price.toFixed(2)} TL
        </span>
      </div>
    );
  }
  return <span className="font-medium">{price.toFixed(2)} TL</span>;
};

const TableProducts = ({ products, totalPages, currentPage }) => {
  const [searchValue, setSearchValue] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const handlePagination = (newPage: number) => {
    const current = new URLSearchParams(Array.from(params.entries()));
    current.set("page", newPage.toString());
    const sort = params.get("sort");
    const search = params.get("search");
    if (sort) current.set("sort", sort);
    if (search) current.set("search", search);
    const queryString = current.toString();
    router.push(`/admin/urunler${queryString ? `?${queryString}` : ""}`);
  };

  const onSort = (value: string) => {
    const current = new URLSearchParams(Array.from(params.entries()));
    current.set("sort", value);
    current.set("page", "1");
    const search = params.get("search");
    if (search) current.set("search", search);
    const queryString = current.toString();
    router.push(`/admin/urunler${queryString ? `?${queryString}` : ""}`);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      const response = await DeleteProduct(selectedProduct.id);
      if (response.status === 200) {
        router.refresh();
      }
    } catch (error) {
      console.error("Ürün silinirken hata oluştu:", error);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  return (
    <ScrollArea>
      <div className="w-full flex flex-row gap-5">
        <TextInput
          className="w-1/4"
          placeholder="Ürün arayın"
          size="sm"
          value={searchValue}
          onChange={(event) => setSearchValue(event.currentTarget.value)}
          rightSection={
            searchValue && (
              <UnstyledButton
                component={Link}
                href={"/admin/urunler?search=" + searchValue}
              >
                <FaSearch />
              </UnstyledButton>
            )
          }
        />
        <Menu
          shadow="lg"
          width={220}
          withArrow
          transitionProps={{ transition: "scale-y", duration: 150 }}
        >
          <Menu.Target>
            <Button
              leftSection={<BiSort size={16} />}
              variant="light"
              className="bg-white hover:bg-gray-50"
            >
              Sırala
            </Button>
          </Menu.Target>

          <Menu.Dropdown className="p-1">
            <Menu.Item
              className="hover:bg-blue-50 rounded-md transition-colors duration-150"
              leftSection={<BiTime className="text-blue-600" size={16} />}
              onClick={() => onSort("newest")}
            >
              En Yeni
            </Menu.Item>
            <Menu.Item
              className="hover:bg-blue-50 rounded-md transition-colors duration-150"
              leftSection={<BiHistory className="text-blue-600" size={16} />}
              onClick={() => onSort("oldest")}
            >
              En Eski
            </Menu.Item>
            <Menu.Divider className="my-2" />
            <Menu.Item
              className="hover:bg-blue-50 rounded-md transition-colors duration-150"
              leftSection={<BiSortUp className="text-blue-600" size={16} />}
              onClick={() => onSort("price-high")}
            >
              En Yüksek Fiyat
            </Menu.Item>
            <Menu.Item
              className="hover:bg-blue-50 rounded-md transition-colors duration-150"
              leftSection={<BiSortDown className="text-blue-600" size={16} />}
              onClick={() => onSort("price-low")}
            >
              En Düşük Fiyat
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Button
          variant="light"
          component={Link}
          href={"/admin/urunler/urun-ekle"}
        >
          Ürün Ekle
        </Button>
      </div>
      <Table.ScrollContainer minWidth={900}>
        <Table verticalSpacing={"sm"}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ürün</Table.Th>
              <Table.Th>Varyant Türü</Table.Th>
              <Table.Th>Varyant Değeri</Table.Th>
              <Table.Th>Stok</Table.Th>
              <Table.Th>İndirim</Table.Th>
              <Table.Th>Fiyat</Table.Th>
              <Table.Th>İşlem</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((product, index) => (
              <Table.Tr
                key={index}
                className="transition-colors hover:bg-gray-50 group"
              >
                <Table.Td className="font-medium text-gray-900">
                  {product.product.name}
                </Table.Td>
                <Table.Td className="text-gray-600">{product.type}</Table.Td>
                <Table.Td>
                  {product.type === VariantType.COLOR && (
                    <div className="flex items-center gap-2">
                      <Tooltip label={product.value}>
                        <ColorSwatch color={product.value} size={24} />
                      </Tooltip>
                    </div>
                  )}
                  {product.type === VariantType.WEIGHT && (
                    <span className="text-gray-600">
                      {product.value} {product.unit}
                    </span>
                  )}
                  {product.type === VariantType.SIZE && (
                    <span className="text-gray-600">{product.value}</span>
                  )}
                </Table.Td>
                <Table.Td>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-sm ${
                      product.stock > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock}
                  </span>
                </Table.Td>
                <Table.Td>
                  {product.discount > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-sm">
                      %{product.discount}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </Table.Td>
                <Table.Td>
                  <PriceDisplay
                    price={product.price}
                    discount={product.discount}
                  />
                </Table.Td>
                <Table.Td>
                  <div className="flex gap-2">
                    <Button
                      component={Link}
                      href={`/admin/urunler/${product.slug}`}
                      variant="light"
                      size="xs"
                      className="opacity-70 group-hover:opacity-100 transition-opacity"
                      leftSection={<BiEdit size={14} />}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      className="opacity-70 group-hover:opacity-100 transition-opacity"
                      leftSection={<BiTrash size={14} />}
                      onClick={() => {
                        setSelectedProduct(product);
                        setDeleteModalOpen(true);
                      }}
                    >
                      Sil
                    </Button>
                  </div>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <div className="w-full flex flex-row justify-center mt-10">
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={handlePagination}
        />
      </div>

      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        title="Ürünü Sil"
        centered
      >
        <div className="flex flex-col gap-4">
          <p>
            &quot;{selectedProduct?.product.name}&quot; ürününü silmek
            istediğinizden emin misiniz?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="light"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedProduct(null);
              }}
            >
              İptal
            </Button>
            <Button color="red" loading={isDeleting} onClick={handleDelete}>
              Sil
            </Button>
          </div>
        </div>
      </Modal>
    </ScrollArea>
  );
};

export default TableProducts;
