"use client";
import CustomImage from "@/components/CustomImage";
import { formattedPrice } from "@/lib/format";
import {
  Card,
  Center,
  Group,
  ScrollArea,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { endOfDay, startOfDay, subDays, subMonths, subWeeks } from "date-fns";
import { useState } from "react";
import { FiPackage } from "react-icons/fi";
import { OrderWithItems } from "../page";
import OrderHeader from "./OrderHeader";

export const TIME_FILTERS = [
  { value: "today", label: "Bugün" },
  { value: "yesterday", label: "Dün" },
  { value: "1week", label: "Son 1 Hafta" },
  { value: "2weeks", label: "Son 2 Hafta" },
  { value: "1month", label: "Son 1 Ay" },
  { value: "2months", label: "Son 2 Ay" },
  { value: "3months", label: "Son 3 Ay" },
  { value: "6months", label: "Son 6 Ay" },
  { value: "thisMonth", label: "Bu Ay" },
  { value: "lastMonth", label: "Geçen Ay" },
];

export const calculateDateRange = (filterValue) => {
  const now = new Date();
  let startDate = now;
  let endDate = endOfDay(now);

  switch (filterValue) {
    case "today":
      startDate = startOfDay(now);
      break;

    case "yesterday":
      startDate = startOfDay(subDays(now, 1));
      endDate = endOfDay(subDays(now, 1));
      break;

    case "1week":
      startDate = startOfDay(subWeeks(now, 1));
      break;

    case "2weeks":
      startDate = startOfDay(subWeeks(now, 2));
      break;

    case "1month":
      startDate = startOfDay(subMonths(now, 1));
      break;

    case "2months":
      startDate = startOfDay(subMonths(now, 2));
      break;

    case "3months":
      startDate = startOfDay(subMonths(now, 3));
      break;

    case "6months":
      startDate = startOfDay(subMonths(now, 6));
      break;

    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;

    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;

    default:
      startDate = startOfDay(subMonths(now, 1));
  }

  return {
    startDate,
    endDate,
    filterLabel: TIME_FILTERS.find((f) => f.value === filterValue)?.label,
  };
};

const OrdersTable = ({ orders }: { orders: OrderWithItems[] }) => {
  const [timeFilter, setTimeFilter] = useState("1month");
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [searchQuery, setSearchQuery] = useState("");

  const onSelectChange = (value: string) => {
    const { startDate, endDate } = calculateDateRange(value);
    setTimeFilter(value);
    filterOrders(value, searchQuery);
  };

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.currentTarget.value;
    setSearchQuery(query);
    filterOrders(timeFilter, query);
  };

  const filterOrders = (timeValue: string, query: string) => {
    const { startDate, endDate } = calculateDateRange(timeValue);

    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const matchesDate = orderDate >= startDate && orderDate <= endDate;

      if (!query) return matchesDate;

      const lowercaseQuery = query.toLowerCase().trim();

      // Sipariş numarasında arama
      const matchesOrderNumber = order.orderNumber
        .toLowerCase()
        .includes(lowercaseQuery);

      // Ürün isimlerinde arama
      const matchesProductNames = order.orderItems.some((item) =>
        item.variant.product.name.toLowerCase().includes(lowercaseQuery),
      );

      return matchesDate && (matchesOrderNumber || matchesProductNames);
    });

    setFilteredOrders(filtered);
  };

  const EmptyState = () => (
    <Center className="flex flex-col gap-3 py-12">
      <FiPackage size={48} className="text-gray-400" />
      <Text size="lg" fw={500} c="dimmed">
        Sipariş Bulunamadı
      </Text>
      <Text size="sm" c="dimmed" className="max-w-md text-center">
        {searchQuery
          ? `"${searchQuery}" ile eşleşen sipariş veya ürün bulunamadı. Farklı bir arama terimi ile tekrar deneyebilirsiniz.`
          : "Seçili tarih aralığında sipariş bulunamadı. Farklı bir tarih aralığı seçebilirsiniz."}
      </Text>
    </Center>
  );
  return (
    <div className="flex flex-col gap-5">
      <div className="flex min-h-[5rem] w-full flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-gray-900 md:w-1/4">
          Siparişlerim
        </h1>
        <div className="flex flex-col gap-3 md:w-3/4 md:flex-row md:items-center md:justify-end">
          <TextInput
            placeholder="Sipariş numarası veya ürün adı ile ara..."
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full md:w-64"
          />
          <Select
            data={TIME_FILTERS}
            value={timeFilter}
            onChange={onSelectChange}
            placeholder="Zaman aralığı seç"
            className="w-full md:w-48"
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const totalProduct = order.orderItems.reduce(
              (acc, item) => acc + item.quantity,
              0,
            );
            return (
              <div key={order.id} className="flex flex-col">
                <OrderHeader
                  createdAt={order.createdAt}
                  orderNumber={order.orderNumber}
                  orderStatus={order.orderStatus}
                  paidPrice={order.paidPrice}
                  quantitySum={totalProduct}
                  orderDetail={true}
                  href={`/hesabim/siparislerim/${order.orderNumber}`}
                />
                {order.orderItems.length > 0 && (
                  <ProductImagesScroll orderItems={order.orderItems} />
                )}
              </div>
            );
          })
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default OrdersTable;
const ProductImagesScroll = ({ orderItems }) => {
  return (
    <Card radius="sm" className="w-full">
      <ScrollArea.Autosize
        offsetScrollbars
        scrollbarSize={6}
        scrollHideDelay={500}
        type="hover"
        className="max-h-52" // Sabit maksimum yükseklik
      >
        <div className="flex h-48 gap-4 px-2 py-2">
          {orderItems.map((item, index) => {
            if (item.variant.Image?.[0]) {
              return (
                <Card
                  key={index}
                  p={0}
                  radius="md"
                  className="h-full min-w-[140px] shrink-0 overflow-hidden border transition-shadow hover:shadow-md"
                >
                  <div className="relative h-[100px] w-[140px]">
                    <CustomImage src={item.variant.Image[0].url} quality={20} />
                  </div>

                  <div className="flex h-[80px] flex-col justify-between p-2">
                    <Text size="sm" lineClamp={2} className="font-medium">
                      {item.variant.product?.name}
                    </Text>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="xs" c="dimmed">
                        {item.quantity} adet
                      </Text>
                      <Text size="xs" className="font-medium">
                        {formattedPrice(item.totalPrice)}
                      </Text>
                    </Group>
                  </div>
                </Card>
              );
            }
            return null;
          })}
        </div>
      </ScrollArea.Autosize>
    </Card>
  );
};
