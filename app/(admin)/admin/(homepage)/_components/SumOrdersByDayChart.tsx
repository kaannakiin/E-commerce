"use client";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SumOrdersByDayChartProps {
  date: string;
  total: number;
  count: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const amount = payload[0]?.value;
  const count = payload[0]?.payload?.count;

  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-lg">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <p className="text-sm text-gray-600">
        Toplam Satış:{" "}
        <span className="font-medium">
          {amount !== undefined
            ? amount.toLocaleString("tr-TR")
            : "Yükleniyor..."}{" "}
          ₺
        </span>
      </p>
      <p className="text-sm text-gray-600">
        Sipariş Adedi:{" "}
        <span className="font-medium">
          {count !== undefined ? count : "Yükleniyor..."}
        </span>
      </p>
    </div>
  );
};

const SumOrdersByDayChart = ({
  data,
}: {
  data: SumOrdersByDayChartProps[];
}) => {
  const totalSales = data.reduce((sum, item) => sum + item.total, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="text-sm text-gray-500">Toplam Satış</h3>
          <p className="text-xl font-semibold">
            {totalSales.toLocaleString("tr-TR")} ₺
          </p>
        </div>
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="text-sm text-gray-500">Sipariş Adedi</h3>
          <p className="text-xl font-semibold">
            {totalOrders.toLocaleString("tr-TR")}
          </p>
        </div>
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="text-sm text-gray-500">Ortalama Sipariş Tutarı</h3>
          <p className="text-xl font-semibold">
            {averageOrderValue.toLocaleString("tr-TR", {
              maximumFractionDigits: 0,
            })}{" "}
            ₺
          </p>
        </div>
      </div>
      <div className="h-[400px] rounded-lg border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString("tr-TR")}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#8b771b"
              strokeWidth={2}
              name="Toplam Satış"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SumOrdersByDayChart;
