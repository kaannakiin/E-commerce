import { formattedPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import OrderChart from "./_components/OrderChart";
import UserChart from "./_components/UserChart";
import ProductSalesChart from "./_components/ProductSalesChart";
import NewOrder from "./_components/NewOrder";
import WeeklyNewUserWatch from "./_components/WeeklyNewUserWatch";
import StatsCards from "./_components/AdminNavbarCards";

const orderFeed = async () => {
  const sales = await prisma.order.aggregate({
    _sum: {
      paidPrice: true,
    },
    _count: true,
  });
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [totalUsers, weeklyUsersCount, weeklyUsers] = await Promise.all([
    prisma.user.count(), // Toplam kullanıcı sayısı
    prisma.user.count({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    }),
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        image: true,
        // İhtiyacınız olan diğer alanları ekleyebilirsiniz
      },
      orderBy: {
        createdAt: "desc", // En yeni kullanıcılar önce
      },
    }),
  ]);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const dailyOrders = await prisma.order.groupBy({
    by: ["createdAt"],
    _sum: {
      paidPrice: true,
    },
    where: {
      createdAt: {
        gte: startDate,
      },
    },
  });

  const fillMissingDates = (orders) => {
    const result = [];
    const end = new Date();
    const current = new Date(startDate);

    while (current <= end) {
      const dateStr = current.toLocaleString("tr-TR", {
        day: "numeric",
        month: "long",
        weekday: "long",
      });

      const isoDateStr = current.toISOString().split("T")[0];
      const dayOrder = orders.find(
        (order) => order.createdAt.toISOString().split("T")[0] === isoDateStr,
      );

      result.push({
        date: dateStr, // Örnek: "15 Kasım Cuma"
        totalSales: dayOrder ? dayOrder._sum.paidPrice : 0,
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  };
  const dailyUsers = await prisma.user.groupBy({
    by: ["createdAt"],
    _count: {
      id: true, // günlük yeni üye sayısı
    },
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const formatDailyUsers = dailyUsers.map((curr) => ({
    date: curr.createdAt.toLocaleString("tr-TR", {
      day: "numeric",
      month: "long",
    }),
    newUsers: curr._count.id, // O gün katılan yeni üyeler
  }));

  const fillUserDates = () => {
    const result = [];
    const end = new Date();
    const current = new Date(startDate);

    while (current <= end) {
      const dateStr = current.toLocaleString("tr-TR", {
        day: "numeric",
        month: "long",
      });

      const dayData = formatDailyUsers.find((d) => d.date === dateStr);

      result.push({
        date: dateStr,
        newUsers: dayData ? dayData.newUsers : 0,
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  };
  const completeUserData = fillUserDates();
  const completeOrders = fillMissingDates(dailyOrders);

  const detailedTopSelling = await prisma.orderItems
    .groupBy({
      by: ["variantId"],
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    })
    .then(async (results) => {
      const variantDetails = await prisma.variant.findMany({
        where: {
          id: {
            in: results.map((item) => item.variantId),
          },
        },
        select: {
          id: true,
          type: true,
          value: true,
          product: {
            select: {
              name: true,
            },
          },
          unit: true,
        },
      });

      // Sonuçları birleştir
      return results.map((item) => ({
        ...item,
        variant: variantDetails.find((v) => v.id === item.variantId),
        totalQuantity: item._sum.quantity,
        totalRevenue: item._sum.totalPrice,
      }));
    });
  const orderSelect: Prisma.OrderSelect = {
    _count: {
      select: {
        orderItems: true,
      },
    },
    address: true,
    orderNumber: true,
    paidPrice: true,
  };
  const newOrders = await prisma.order
    .findMany({ select: orderSelect })
    .then((orders) =>
      orders.map((order) => ({
        ...order,
        address: {
          ...order.address,
          createdAt: order.address.createdAt.toISOString(),
        },
      })),
    );
  return {
    sales,
    totalUsers,
    weeklyUsersCount,
    completeOrders,
    completeUserData,
    detailedTopSelling,
    newOrders,
    weeklyUsers,
  };
};

const DashboardPage = async () => {
  const {
    sales,
    totalUsers,
    weeklyUsersCount,
    completeOrders,
    completeUserData,
    detailedTopSelling,
    newOrders,
    weeklyUsers,
  } = await orderFeed();
  console.log(completeOrders);
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>
      <StatsCards
        sales={sales}
        totalUsers={totalUsers}
        weeklyUsersCount={weeklyUsersCount}
      />
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <OrderChart orders={completeOrders} />
        <UserChart userData={completeUserData} />
        <ProductSalesChart data={detailedTopSelling} />
        <WeeklyNewUserWatch users={weeklyUsers} />
        {/* Kart 3 */}
      </div>

      {/* Alt Kartlar - Detaylı Grafikler */}
      <div className="grid grid-cols-1 gap-4">
        <NewOrder orders={newOrders} />
      </div>
    </div>
  );
};

export default DashboardPage;
