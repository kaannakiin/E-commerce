"use client";
import { Button, Table } from "@mantine/core";
import React from "react";
import { BlogDataType } from "../page";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

interface BlogTableProps {
  data: BlogDataType;
}
const BlogTable = ({ data }: BlogTableProps) => {
  return (
    <Table.ScrollContainer minWidth={800}>
      <Table highlightOnHover verticalSpacing="xs">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Başlık</Table.Th>
            <Table.Th>Yazar</Table.Th>
            <Table.Th>Oluşturulma Tarihi</Table.Th>
            <Table.Th>İşlemler</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((blog) => (
            <Table.Tr key={blog.id}>
              <Table.Td>{blog.blogTitle}</Table.Td>
              <Table.Td>{blog.author}</Table.Td>
              <Table.Td>
                {format(new Date(blog.createdAt), "d MMMM yyyy hh:mm", {
                  locale: tr,
                })}
              </Table.Td>
              <Table.Td>
                <Button
                  size="sm"
                  variant="outline"
                  component={Link}
                  href={`/admin/blog/${blog.id}`}
                >
                  Düzenle
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default BlogTable;
