"use client";
import SpecialPagination from "@/components/Pagination";
import {
  formattedDate,
  formattedPrice,
  getOrderStatusConfig,
} from "@/lib/format";
import {
  Badge,
  Box,
  Button,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { CgDanger } from "react-icons/cg";
import { FaEye as IconEye } from "react-icons/fa";
import { OrderForOrderTable } from "../page";
import OrderSearchHeader from "./OrderSearch";
const OrdersTable = ({
  orders,
  totalPages,
  currentPage,
}: {
  orders: OrderForOrderTable[];
  totalPages: number;
  currentPage: number;
}) => {
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
              <Table.Th>Ödeme Durumu</Table.Th>
              <Table.Th>Odeme Türü</Table.Th>
              <Table.Th>Toplam</Table.Th>
              <Table.Th>Sipariş Tarihi</Table.Th>
              <Table.Th className="w-32 text-center">İşlem</Table.Th>
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
                  <div className="flex flex-col gap-1">
                    <Text size="sm" fw={500}>
                      {order.address.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {order.address.email}
                    </Text>
                  </div>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {order.paymentType === "BANK_TRANSFER"
                      ? "Havale/EFT"
                      : "Kredi Kartı"}
                  </Text>
                </Table.Td>
                <Table.Td>{order._count.OrderItems}</Table.Td>
                <Table.Td>
                  {order.paymentType === "BANK_TRANSFER" &&
                  order.paymentStatus === "PENDING"
                    ? "Havale bekliyor"
                    : getOrderStatusConfig(order.status).text}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      order.paymentStatus === "SUCCESS"
                        ? "green"
                        : order.paymentStatus === "FAILED"
                          ? "red"
                          : "yellow"
                    }
                  >
                    {order.paymentStatus === "SUCCESS"
                      ? "Ödeme Başarılı"
                      : order.paymentStatus === "FAILED"
                        ? "Ödeme Başarısız"
                        : "Ödeme Bekliyor"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {formattedPrice(order.total)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {formattedDate(order.createdAt.toISOString())}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="light"
                      size="xs"
                      component={Link}
                      href={"/admin/siparisler/" + order.orderNumber}
                      leftSection={<IconEye size={14} />}
                    >
                      Detay
                    </Button>
                    {order.OrderItems.some(
                      (item) =>
                        item.refundStatus === "REQUESTED" ||
                        item.refundStatus === "PROCESSING",
                    ) && (
                      <Tooltip label="İade talebi/işlemi mevcut">
                        <div className="flex items-center">
                          <CgDanger size={24} className="text-red-500" />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      <SpecialPagination totalPages={totalPages} currentPage={currentPage} />
    </Box>
  );
};

export default OrdersTable;
