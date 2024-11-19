"use client";
"use client";
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const OrderChart = ({ orders }) => {
  const lastDayValue = orders[orders.length - 1]?.totalSales || 0;
  const previousDayValue = orders[orders.length - 2]?.totalSales || 0;
  const percentageChange =
    previousDayValue !== 0
      ? (((lastDayValue - previousDayValue) / previousDayValue) * 100).toFixed(
          1,
        )
      : 0;

  const totalSales = orders.reduce((sum, order) => sum + order.totalSales, 0);
  const averageSales =
    totalSales / orders.filter((order) => order.totalSales > 0).length;

  const formatXAxis = (date) => {
    const parts = date.split(" ");
    return `${parts[0]} ${parts[1]}`; // Sadece gün ve ay göster
  };

  return (
    <div className="rounded-lg bg-white p-2 shadow transition-shadow hover:shadow-lg lg:p-6">
      <h3 className="mb-2 text-lg font-semibold text-gray-700">
        Günlük Satış Grafiği
      </h3>
      <div className="relative mb-4 h-72 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={orders}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{
                fontSize: 11,
                fill: "#666",
                dy: 8, // Y ekseninde offset
              }}
              tickFormatter={formatXAxis}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80} // Yükseklik artırıldı
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `₺${value.toLocaleString()}`}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip
              formatter={(value) => [`₺${value.toLocaleString()}`, "Satış"]}
              labelStyle={{ color: "#666" }}
              contentStyle={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="totalSales"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorSales)"
              name="Satış"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-2xl font-bold text-gray-800">
        ₺{averageSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </p>
      <p
        className={`text-sm ${
          Number(percentageChange) >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {Number(percentageChange) > 0 ? "+" : ""}
        {percentageChange}% önceki güne göre
      </p>
    </div>
  );
};

export default OrderChart;
