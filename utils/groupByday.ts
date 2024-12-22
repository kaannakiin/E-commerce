// utils/formatChartData.ts
import { SumOrdersByDayChartProps } from "@/app/(admin)/admin/(homepage)/_components/SumOrdersByDayChart";
import {
  format,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  parseISO,
} from "date-fns";
import { tr } from "date-fns/locale";

interface DataItem {
  createdAt: string | Date;
  total: number;
  // diğer alanlar...
}
interface UserDataItem {
  createdAt: string | Date;
  id: string;
}
export const formatChartData = (
  data: DataItem[],
  dateRange: { gte: string; lte: string },
): SumOrdersByDayChartProps[] => {
  // Tarih aralığındaki tüm günleri al
  const interval = {
    start: parseISO(dateRange.gte),
    end: parseISO(dateRange.lte),
  };

  // Tarih aralığındaki her gün için bir dizi oluştur
  const allDays = eachDayOfInterval(interval);

  // Her gün için varsayılan değerlerle bir obje oluştur
  const defaultData = allDays.reduce((acc, date) => {
    const dayStr = format(date, "yyyy-MM-dd");
    acc[dayStr] = {
      date: format(date, "d MMMM", { locale: tr }),
      total: 0,
      count: 0,
    };
    return acc;
  }, {});

  // Gelen veriyi günlere göre grupla
  data.forEach((item) => {
    const date =
      typeof item.createdAt === "string"
        ? parseISO(item.createdAt)
        : item.createdAt;

    const dayStr = format(date, "yyyy-MM-dd");

    if (defaultData[dayStr]) {
      defaultData[dayStr].total += item.total;
      defaultData[dayStr].count += 1;
    }
  });

  // Grafik için uygun formata dönüştür
  return Object.values(defaultData);
};

export const formatUserChartData = (
  data: UserDataItem[],
  dateRange: { gte: string; lte: string },
) => {
  // Tarih aralığındaki tüm günleri al
  const interval = {
    start: parseISO(dateRange.gte),
    end: parseISO(dateRange.lte),
  };

  // Tarih aralığındaki her gün için bir dizi oluştur
  const allDays = eachDayOfInterval(interval);

  // Her gün için varsayılan değerlerle bir obje oluştur
  const defaultData = allDays.reduce((acc, date) => {
    const dayStr = format(date, "yyyy-MM-dd");
    acc[dayStr] = {
      date: format(date, "d MMMM", { locale: tr }),
      totalUsers: 0,
      newUsers: 0,
    };
    return acc;
  }, {});

  // Gelen kullanıcı verisini günlere göre grupla
  data.forEach((user) => {
    const date =
      typeof user.createdAt === "string"
        ? parseISO(user.createdAt)
        : user.createdAt;

    const dayStr = format(date, "yyyy-MM-dd");

    if (defaultData[dayStr]) {
      defaultData[dayStr].newUsers += 1;
    }
  });

  // Her gün için kümülatif toplam hesapla
  let runningTotal = 0;
  Object.keys(defaultData)
    .sort()
    .forEach((dayStr) => {
      runningTotal += defaultData[dayStr].newUsers;
      defaultData[dayStr].totalUsers = runningTotal;
    });

  // Grafik için uygun formata dönüştür
  return Object.values(defaultData);
};
// utils/dateRangeFormatter.ts

export const getDateRangeFromSelection = (selection: string) => {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // Günün sonu

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0); // Günün başlangıcı

  switch (selection) {
    case "today": {
      return {
        gte: startDate.toISOString(),
        lte: now.toISOString(),
      };
    }

    case "yesterday": {
      const yesterdayStart = new Date(startDate);
      yesterdayStart.setDate(startDate.getDate() - 1);
      const yesterdayEnd = new Date(yesterdayStart);
      yesterdayEnd.setHours(23, 59, 59, 999);

      return {
        gte: yesterdayStart.toISOString(),
        lte: yesterdayEnd.toISOString(),
      };
    }

    case "thisWeek": {
      const firstDayOfWeek = new Date(startDate);
      const currentDay = startDate.getDay();
      const diff =
        startDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Pazartesi'yi bul
      firstDayOfWeek.setDate(diff);

      return {
        gte: firstDayOfWeek.toISOString(),
        lte: now.toISOString(),
      };
    }

    case "lastWeek": {
      const firstDayOfLastWeek = new Date(startDate);
      const currentDay = startDate.getDay();
      const diff = startDate.getDate() - currentDay - 6; // Geçen haftanın Pazartesi'si
      firstDayOfLastWeek.setDate(diff);

      const lastDayOfLastWeek = new Date(firstDayOfLastWeek);
      lastDayOfLastWeek.setDate(firstDayOfLastWeek.getDate() + 6);
      lastDayOfLastWeek.setHours(23, 59, 59, 999);

      return {
        gte: firstDayOfLastWeek.toISOString(),
        lte: lastDayOfLastWeek.toISOString(),
      };
    }

    case "thisMonth": {
      const firstDayOfMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1,
      );

      return {
        gte: firstDayOfMonth.toISOString(),
        lte: now.toISOString(),
      };
    }

    case "lastMonth": {
      const firstDayOfLastMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth() - 1,
        1,
      );
      const lastDayOfLastMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );

      return {
        gte: firstDayOfLastMonth.toISOString(),
        lte: lastDayOfLastMonth.toISOString(),
      };
    }

    case "all": {
      return {};
    }

    default: {
      // Sayısal değerler için (7, 14, 30, 90 gün)
      const days = parseInt(selection);
      if (!isNaN(days)) {
        const pastDate = new Date(startDate);
        pastDate.setDate(startDate.getDate() - days);

        return {
          gte: pastDate.toISOString(),
          lte: now.toISOString(),
        };
      }
      return {
        gte: startDate.toISOString(),
        lte: now.toISOString(),
      };
    }
  }
};
