import { prisma } from "@/lib/prisma";
import { Params, SearchParams } from "@/types/types";
import {
  formatChartData,
  formatUserChartData,
  getDateRangeFromSelection,
} from "@/utils/groupByday";
import { cache, Suspense } from "react";
import Charts from "./_components/Charts";
import HomePageHeader from "./_components/HomePageHeader";
import SumOrdersByDayChart from "./_components/SumOrdersByDayChart";
import SumUserByChart from "./_components/SumUserByChart";
import Loading from "@/app/loading";
import SumRefundOrderChart from "./_components/SumRefundOrderChart";
// types/types.ts
export interface DateRange {
  gte: string;
  lte: string;
}

// Sales chart data point
export interface ChartDataPoint {
  date: string;
  value: number;
}

// Extend ChartDataPoint for specific use cases
export interface SumOrdersByDayChartProps {
  date: string;
  total: number;
  count: number;
}

export interface UserChartDataPoint {
  date: string;
  totalUsers: number;
  newUsers: number;
}

export interface FeedPageResponse {
  chartData?: SumOrdersByDayChartProps[]; // Changed from ChartDataPoint[]
  stats: {
    orders: {
      total: number;
      count: number;
    };
    users: {
      count: number;
    };
    refunds?: {
      total: number;
      count: number;
    };
  };
  userAnalytics?: {
    totalUsers: number;
    usersInDateRange: number;
    dailyUsers: UserChartDataPoint[]; // Changed from ChartDataPoint[]
  };
}
const feedPage = cache(
  async (range: string, tab: string): Promise<FeedPageResponse> => {
    const { gte, lte } = getDateRangeFromSelection(range);
    const baseStats = async () => {
      const orderStats = await prisma.order.aggregate({
        where: {
          createdAt: { gte, lte },
          paymentStatus: "SUCCESS",
          NOT: { status: "CANCELLED" },
        },
        _sum: { total: true },
        _count: { _all: true },
      });

      const userStats = await prisma.user.aggregate({
        where: { createdAt: { gte, lte } },
        _count: { _all: true },
      });

      const stats = {
        orders: {
          total: orderStats._sum.total ?? 0,
          count: orderStats._count._all ?? 0,
        },
        users: {
          count: userStats._count._all ?? 0,
        },
      };

      if (tab === "sumReturn") {
        const refundStats = await prisma.order.aggregate({
          where: {
            createdAt: { gte, lte },
            status: "CANCELLED",
          },
          _count: { _all: true },
          _sum: { total: true },
        });

        return {
          ...stats,
          refunds: {
            total: refundStats._sum.total ?? 0,
            count: refundStats._count._all ?? 0,
          },
        };
      }

      return stats;
    };

    const stats = await baseStats();

    switch (tab) {
      case "sumSales": {
        const salesData = await prisma.order.findMany({
          where: {
            createdAt: { gte, lte },
            paymentStatus: "SUCCESS",
          },
          select: {
            total: true,
            createdAt: true,
          },
        });

        return {
          stats,
          chartData: formatChartData(salesData, { gte, lte }),
        };
      }

      case "sumReturn": {
        const refundData = await prisma.order.findMany({
          where: {
            createdAt: { gte, lte },
            status: "CANCELLED",
          },
          select: {
            total: true,
            createdAt: true,
          },
        });

        return {
          stats,
          chartData: formatChartData(refundData, { gte, lte }),
        };
      }

      case "sumUser": {
        const [totalUsers, usersInDateRange, users] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({
            where: { createdAt: { gte, lte } },
          }),
          prisma.user.findMany({
            where: { createdAt: { gte, lte } },
            select: {
              id: true,
              createdAt: true,
            },
          }),
        ]);

        return {
          stats,
          userAnalytics: {
            totalUsers,
            usersInDateRange,
            dailyUsers: formatUserChartData(users, {
              gte,
              lte,
            }) as UserChartDataPoint[],
          },
        };
      }

      default:
        return {
          stats,
          chartData: [],
        };
    }
  },
);
async function ChartWrapper({ range, tab }: { range: string; tab: string }) {
  try {
    const data = await feedPage(range, tab);

    // Veri yoksa veya undefined ise
    if (!data) {
      return (
        <div className="flex h-[400px] w-full items-center justify-center rounded-lg border">
          <p className="text-gray-500">Veri bulunamadı</p>
        </div>
      );
    }

    return (
      <div className="h-[400px] w-full">
        {tab === "sumSales" && (
          <SumOrdersByDayChart data={data.chartData ?? []} />
        )}
        {tab === "sumUser" && (
          <SumUserByChart
            data={
              data.userAnalytics ?? {
                totalUsers: 0,
                usersInDateRange: 0,
                dailyUsers: [],
              }
            }
          />
        )}
        {tab === "sumReturn" && (
          <SumRefundOrderChart data={data.chartData ?? []} />
        )}
      </div>
    );
  } catch (error) {
    console.error("Chart error:", error);
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border">
        <p className="text-gray-500">Veriler yüklenirken bir hata oluştu</p>
      </div>
    );
  }
}

const HomePage = async (params: {
  params: Params;
  searchParams: SearchParams;
}) => {
  try {
    const searchParams = await params.searchParams;
    const range = (searchParams.range as string) || "7";
    const tab = (searchParams.tab as string) || "sumSales";

    return (
      <div className="flex w-full flex-col gap-3 p-4">
        <HomePageHeader />
        <Charts />
        <Suspense
          fallback={
            <div className="flex h-[400px] w-full items-center justify-center">
              <Loading />
            </div>
          }
        >
          <ChartWrapper range={range} tab={tab} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Page error:", error);
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-gray-500">Sayfa yüklenirken bir hata oluştu</p>
      </div>
    );
  }
};
export default HomePage;
