import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import { OrderStatus, Prisma } from "@prisma/client";
import OrderTable from "./_components/OrderTable";
const feedOrderPage = async (
  skip: number,
  limit: number,
  orderNumber?: string,
  startDate?: string,
  endDate?: string,
  search?: string,
  status?: OrderStatus,
) => {
  const isValidDate = (dateString?: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Where koşullarını ayrı oluşturalım
  const whereConditions: Prisma.OrderWhereInput = {
    ...(orderNumber && { orderNumber: { contains: orderNumber } }),
    ...(status && { orderStatus: status }),
    ...(search && {
      OR: [
        { address: { name: { contains: search } } },
        { address: { email: { contains: search } } },
        { orderNumber: { contains: search } },
      ],
    }),
  };

  // Geçerli tarihler varsa ekleyelim
  if (isValidDate(startDate) || isValidDate(endDate)) {
    whereConditions.createdAt = {};

    if (isValidDate(startDate)) {
      const start = new Date(startDate!);
      start.setDate(start.getDate() + 1);
      whereConditions.createdAt.gte = start;
    }
    if (isValidDate(endDate)) {
      const end = new Date(endDate!);
      end.setDate(end.getDate() + 1);
      whereConditions.createdAt.lte = end;
    }
  }

  try {
    const totalOrders = await prisma.order.count({
      where: whereConditions,
    });
    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      where: whereConditions,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        orderNumber: true,
        paymentId: true,
        orderStatus: true,
        address: {
          select: {
            name: true,
            email: true,
            user: {
              select: {
                name: true,
                surname: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
        paidPrice: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            surname: true,
            email: true,
          },
        },
      },
    });
    return {
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};
const OrderPage = async (props: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page as string, 10) || 1;
  const limit = parseInt(searchParams.limit as string, 10) || 10;
  const skip = (page - 1) * limit;
  const orderNumber = (searchParams.orderNumber as string) || "";
  const startDate = (searchParams.startDate as string) || "";
  const endDate = (searchParams.endDate as string) || "";
  const search = (searchParams.search as string) || "";
  const status = (searchParams.status as OrderStatus) || undefined;
  const { orders, totalOrders, totalPages } = await feedOrderPage(
    skip,
    limit,
    orderNumber,
    startDate,
    endDate,
    search,
    status,
  );
  return (
    <OrderTable
      orders={orders}
      totalOrder={totalOrders}
      totalPages={totalPages}
      currentPage={page}
    />
  );
};

export default OrderPage;
