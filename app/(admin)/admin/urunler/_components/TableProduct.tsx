"use client";
import { useState } from "react";
import cx from "clsx";
import {
  Button,
  Checkbox,
  Group,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import classes from "./module/table.module.css";
import CustomImage from "@/components/CustomImage";
import Link from "next/link";
import { Products } from "../page";

export function TableSelection({ products }: { products: Products }) {
  const [selection, setSelection] = useState<string[]>([]);
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Text size="xl" fw={500} c="dimmed" mb={8}>
          Ürün Bulunamadı
        </Text>
        <Text size="sm" c="dimmed" maw={400}>
          Arama kriterlerinize uygun ürün bulunamadı. Lütfen farklı filtreler
          deneyiniz veya filtreleri temizleyiniz.
        </Text>
      </div>
    );
  }

  const toggleRow = (name: string) =>
    setSelection((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );

  const toggleAll = () =>
    setSelection((current) =>
      current.length === products.length
        ? []
        : products.map((item) => item.name),
    );

  const rows = products.map((product) => {
    const selected = selection.includes(product.name);
    return (
      <Table.Tr
        key={product.name}
        className={cx({ [classes.rowSelected]: selected })}
      >
        <Table.Td style={{ width: "24px", padding: "12px 8px" }}>
          <Checkbox
            checked={selection.includes(product.name)}
            onChange={() => toggleRow(product.name)}
            size="sm"
          />
        </Table.Td>
        <Table.Td style={{ padding: "12px" }}>
          <Group gap="sm" className="flex flex-row items-center justify-start">
            <div className="relative h-12 w-12">
              {product.Variant[0]?.Image[0]?.url && (
                <CustomImage
                  src={product.Variant[0].Image[0].url}
                  alt={product.name}
                  objectFit="contain"
                />
              )}
            </div>
            <div>
              <Link
                href={`/admin/urunler/${product.id}`}
                className="text-blue-600 hover:underline"
              >
                <Text size="sm" fw={500}>
                  {product.name}
                </Text>
              </Link>
              <Text size="sm" c="dimmed">
                {product._count.Variant} varyant
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td style={{ padding: "12px", textAlign: "center" }}>
          <Text c={product.active ? "green" : "red"}>
            {product.active ? "Aktif" : "Pasif"}
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  });
  return (
    <ScrollArea>
      <Table horizontalSpacing="xs" verticalSpacing="xs" layout="fixed">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: "24px", padding: "12px 8px" }}>
              <Checkbox
                onChange={toggleAll}
                checked={selection.length === products.length}
                indeterminate={
                  selection.length > 0 && selection.length !== products.length
                }
                size="sm"
              />
            </Table.Th>
            <Table.Th style={{ padding: "12px" }}>Ürün</Table.Th>
            <Table.Th style={{ padding: "12px", textAlign: "center" }}>
              Durum
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
