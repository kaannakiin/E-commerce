"use client";
import React from "react";
import {
  Table,
  Badge,
  Button,
  Group,
  ScrollArea,
  Text,
  Box,
} from "@mantine/core";
import { FaEye as IconEye } from "react-icons/fa";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import OrderSearchHeader from "./OrderSearch";
import Link from "next/link";
import SpecialPagination from "@/components/Pagination";

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { color: "yellow", label: "Onay Bekliyor" },
    PROCESSING: { color: "blue", label: "Hazırlanıyor" },
    SHIPPED: { color: "grape", label: "Kargoda" },
    DELIVERED: { color: "green", label: "Teslim Edildi" },
    CANCELLED: { color: "red", label: "İptal Edildi" },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Badge color={config.color} variant="light">
      {config.label}
    </Badge>
  );
};

const OrdersTable = ({ orders, totalPages, totalOrder, currentPage }) => {
  const formatDate = (date) => {
    return format(new Date(date), "dd MMMM yyyy", { locale: tr });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  return (
    <Box>
      <OrderSearchHeader />
      <ScrollArea mb={10}>
        <Table miw={800} striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Sipariş Numarası</Table.Th>
              <Table.Th>Kişi bilgi</Table.Th>
              <Table.Th>Ürün Sayısı</Table.Th>
              <Table.Th>Sipariş Durumu</Table.Th>
              <Table.Th>Toplam</Table.Th>
              <Table.Th>Sipariş Tarihi</Table.Th>
              <Table.Th>İşlem</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orders.map((order) => (
              <Table.Tr key={order.orderNumber}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {order.orderNumber}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <p>{order.address.name} </p> <p>{order.address.email}</p>
                </Table.Td>
                <Table.Td>{order._count.orderItems}</Table.Td>
                <Table.Td>
                  <OrderStatusBadge status={order.orderStatus} />
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {formatPrice(order.paidPrice)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {formatDate(order.createdAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Button
                    variant="light"
                    size="xs"
                    component={Link}
                    href={"/admin/siparisler/" + order.orderNumber}
                    leftSection={<IconEye size={14} />}
                  >
                    Detay
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      <p className="text-sm text-gray-800">
        {totalOrder} siparişten {orders.length} tanesi gösteriliyor.{" "}
        {totalPages} {totalOrder}
      </p>
      <SpecialPagination totalPages={totalPages} currentPage={currentPage} />
    </Box>
  );
};

export default OrdersTable;
