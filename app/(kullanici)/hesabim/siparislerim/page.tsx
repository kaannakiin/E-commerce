import { auth } from "@/auth";
import SpecialPagination from "@/components/Pagination";
import { formattedPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { SearchParams } from "@/types/types";
import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { redirect } from "next/navigation";
import { cache } from "react";
import { FaBox, FaCheckCircle, FaRegClock } from "react-icons/fa";
import OrderHeaderPage from "./_components/OrderHeaderPage";
const feedPage = cache(
  async ({
    id,
    take,
    skip,
    orderBy,
    search,
  }: {
    id: string;
    take: number;
    skip: number;
    orderBy: string;
    search: string;
  }) => {
    try {
      const orders = await prisma.$transaction(async (tx) => {
        const whereCondition: Prisma.OrderWhereInput = {
          userId: id,
          ...(search
            ? {
                orderNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              }
            : {}),
        };

        const orderByCondition: Prisma.OrderOrderByWithRelationInput = (() => {
          switch (orderBy) {
            case "date-desc":
              return { createdAt: Prisma.SortOrder.desc };
            case "date-asc":
              return { createdAt: Prisma.SortOrder.asc };
            case "price-desc":
              return { total: Prisma.SortOrder.desc };
            case "price-asc":
              return { total: Prisma.SortOrder.asc };
            default:
              return { createdAt: Prisma.SortOrder.desc };
          }
        })();

        const orders = await tx.order.findMany({
          where: whereCondition,
          select: {
            total: true,
            orderNumber: true,
            createdAt: true,
            status: true,
            paymentStatus: true,
            _count: {
              select: {
                OrderItems: true,
              },
            },
          },
          orderBy: orderByCondition,
          take,
          skip,
        });

        const total = await tx.order.count({
          where: whereCondition,
        });

        return {
          orders: orders.map((order) => ({
            ...order,
            createdAt: order.createdAt.toISOString(),
            _count: {
              OrderItems: order._count.OrderItems,
            },
          })),
          total,
        };
      });

      return orders;
    } catch (error) {
      console.error("Siparişler yüklenirken hata:", error);
      return { orders: [], total: 0 };
    }
  },
);

const OrderPage = async (params: { searchParams: SearchParams }) => {
  const session = await auth();
  const searchParams = await params.searchParams;
  const page = parseInt(searchParams.page as string, 10) || 1;
  const search = (searchParams.search as string) || null;
  const orderBy = (searchParams.orderBy as string) || "date-desc";
  const take = 10;
  const skip = (page - 1) * take;
  const { orders, total } = await feedPage({
    id: session.user.id,
    take,
    skip,
    orderBy,
    search,
  });
  const totalPages = Math.ceil(total / take);
  if (page > totalPages) {
    redirect(`/hesabim/siparislerim?page=${totalPages}`);
  }
  return (
    <div>
      <OrderHeaderPage />
      <div className="mb-4 grid w-full gap-2">
        {orders && orders.length > 0 ? (
          orders.map((order, index) => (
            <OrderSummaryCard key={order.orderNumber} order={order} />
          ))
        ) : (
          <Text className="text-center text-gray-500">
            {search
              ? "Aradığınız kriterlere uygun sipariş bulunamadı."
              : "Henüz siparişiniz bulunmuyor."}
          </Text>
        )}
      </div>
      <SpecialPagination totalPages={totalPages} currentPage={page} />
    </div>
  );
};

export default OrderPage;
const OrderSummaryCard = ({
  order,
}: {
  order: {
    total: number;
    orderNumber: string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    _count: {
      OrderItems: number;
    };
  };
}) => {
  const formatDate = (dateString) => {
    const date = parseISO(dateString);
    return format(date, "d MMMM yyyy EEEE HH:mm", { locale: tr });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PROCESSING":
        return "#CD7F32"; // Bronze/Amber tonu
      case "PENDING":
        return "#DAA520"; // Goldenrod - bekleme durumu için
      case "CANCELLED":
        return "#8B4513"; // Saddle Brown - iptal durumu için
      case "SHIPPED":
        return "#2F4F4F"; // Dark Slate Gray - kargo durumu için
      case "DELIVERED":
        return "#228B22"; // Forest Green - teslim durumu için
      case "SUCCESS":
        return "#557A95"; // Soft Teal - tamamlandı durumu için
      default:
        return "#8B4513";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PROCESSING":
        return "İşlemde";
      case "PENDING":
        return "Ödeme Bekleniyor";
      case "CANCELLED":
        return "İptal Edildi";
      case "SHIPPED":
        return "Kargoya Verildi";
      case "DELIVERED":
        return "Teslim Edildi";
      case "CANCELLED":
        return "İptal Edildi";
      case "SUCCESS":
        return "Tamamlandı";
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status) => {
    return status === "SUCCESS" ? "Ödendi" : status;
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center justify-between sm:block">
            <div>
              <Text size="sm" c="dimmed">
                Sipariş No
              </Text>
              <Text fw={700}>{order.orderNumber}</Text>
            </div>
            <div className="items-center sm:hidden">
              <Text
                component="a"
                href={`/hesabim/siparislerim/${order.orderNumber}`}
                size="sm"
                className="text-semibold-500 hover:text-semibold-700 font-semibold transition-colors duration-200"
                style={{
                  textDecoration: "none",
                  padding: "6px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  backgroundColor: "#f8fafc",
                  whiteSpace: "nowrap",
                }}
              >
                Sipariş Detayı
              </Text>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 sm:mt-1">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: getStatusColor(order.status),
              }}
            />
            <Text
              size="sm"
              className="font-bold"
              style={{ color: getStatusColor(order.status) }}
            >
              {getStatusText(order.status)}
            </Text>
          </div>
        </div>
        <div className="hidden items-center sm:block">
          <Button
            component="a"
            href={`/hesabim/siparislerim/${order.orderNumber}`}
            size="sm"
            variant="outline"
          >
            Sipariş Detayı
          </Button>
        </div>
      </div>

      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <FaRegClock size={16} style={{ color: "gray" }} />
            <Text size="sm" c="dimmed">
              Sipariş Tarihi
            </Text>
          </Group>
          <Text size="sm">{formatDate(order.createdAt)}</Text>
        </Group>

        <Group justify="space-between">
          <Group gap="xs">
            <FaBox size={16} style={{ color: "gray" }} />
            <Text size="sm" c="dimmed">
              Ürün Sayısı
            </Text>
          </Group>
          <Text size="sm">{order._count.OrderItems} ürün</Text>
        </Group>

        <Group justify="space-between">
          <Group gap="xs">
            <FaCheckCircle size={16} style={{ color: "gray" }} />
            <Text size="sm" c="dimmed">
              Ödeme Durumu
            </Text>
          </Group>
          <Text
            size="sm"
            className="font-bold"
            style={{
              color: getStatusColor("SUCCESS"),
            }}
          >
            {getPaymentStatusText(order.paymentStatus)}
          </Text>
        </Group>

        <Group
          justify="space-between"
          mt="md"
          pt="md"
          style={{ borderTop: "1px solid #eee" }}
        >
          <Text fw={500}>Toplam Tutar</Text>
          <Text fw={700} size="lg">
            {formattedPrice(order.total)}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};
