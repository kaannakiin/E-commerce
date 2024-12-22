"use client";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  Legend,
  Tooltip,
  YAxis,
} from "recharts";

interface RefundChart {
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
  payload?: any[];
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
        İade Tutarı:{" "}
        <span className="font-medium">
          {amount !== undefined
            ? amount.toLocaleString("tr-TR")
            : "Yükleniyor..."}{" "}
          ₺
        </span>
      </p>
      <p className="text-sm text-gray-600">
        İade Adedi:{" "}
        <span className="font-medium">
          {count !== undefined ? count : "Yükleniyor..."}
        </span>
      </p>
    </div>
  );
};

const SumRefundOrderChart = ({ data }: { data: RefundChart[] }) => {
  // Toplam istatistikleri hesapla
  const totalRefunds = data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm text-gray-500">Toplam İade Tutarı</h3>
          <p className="text-xl font-semibold">
            {totalAmount.toLocaleString("tr-TR")} ₺
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm text-gray-500">Toplam İade Adedi</h3>
          <p className="text-xl font-semibold">{totalRefunds}</p>
        </div>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#ef4444"
              strokeWidth={2}
              name="İade Tutarı"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SumRefundOrderChart;
