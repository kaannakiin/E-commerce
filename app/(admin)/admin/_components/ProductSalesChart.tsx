"use client";
import React from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  TooltipProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface ChartDataPoint {
  name: string;
  variantType: string;
  variantValue: string;
  quantity: number;
  revenue: number;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
    value: number;
    name: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <div className="space-y-1">
        <p className="flex items-center justify-between gap-4">
          <span className="text-gray-600">Satış Adedi:</span>
          <span className="font-medium text-gray-800">
            {data.quantity.toLocaleString()}
          </span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-gray-600">Toplam Gelir:</span>
          <span className="font-medium text-gray-800">
            ₺{data.revenue.toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
};

interface ProductSalesChartProps {
  data: Array<{
    variant: {
      type: "COLOR" | "SIZE" | "WEIGHT";
      value: string;
      unit?: string | null;
      product: {
        name: string;
      };
    };
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

const ProductSalesChart: React.FC<ProductSalesChartProps> = ({ data }) => {
  const formattedData = data.map((item) => ({
    name: item.variant.product.name,
    variantType: item.variant.type,
    variantValue: item.variant.value + " " + (item.variant.unit || ""),
    quantity: item.totalQuantity,
    revenue: item.totalRevenue,
  }));

  const renderCustomAxisTick = ({
    x,
    y,
    payload,
  }: {
    x: number;
    y: number;
    payload: {
      value: string;
      index: number;
    };
  }) => {
    const data = formattedData[payload.index];
    const colorBoxSize = 16;
    return (
      <g transform={`translate(${x},${y})`}>
        {data.variantType === "COLOR" && (
          <g transform={`translate(-${colorBoxSize / 2}, 20)`}>
            <rect
              width={colorBoxSize}
              height={colorBoxSize}
              fill={data.variantValue}
              rx={4}
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          </g>
        )}
        <text
          x={0}
          y={45}
          textAnchor="middle"
          fill="#64748B"
          fontSize="12"
          fontWeight={"1000"}
          fontFamily="system-ui"
        >
          {data.name}{" "}
          {data.variantType === "SIZE" && `(${data.variantValue.trim()})`}
          {data.variantType === "WEIGHT" && `(${data.variantValue.trim()})`}
        </text>
      </g>
    );
  };

  return (
    <div className="rounded-lg bg-white p-2 shadow transition-shadow hover:shadow-lg lg:p-6">
      <h3 className="mb-2 text-lg font-semibold text-gray-700">
        Ürün Satış Analizi
      </h3>
      <div className="relative mb-4 h-72 w-full rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formattedData}>
            <XAxis
              dataKey="name"
              tick={renderCustomAxisTick}
              height={70}
              interval={0}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tickFormatter={(value) => value.toString()}
              label={{
                value: "Satış Adedi",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `₺${(value / 1000).toFixed(1)}K`}
              label={{
                value: "Gelir (TL)",
                angle: 90,
                position: "insideRight",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Bar
              yAxisId="left"
              dataKey="quantity"
              name="Satış Adedi"
              fill="#4C6EF5"
              radius={[4, 4, 0, 0]}
              label={{
                position: "top",
                formatter: (value) => value,
                fontSize: 11,
              }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              name="Gelir"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ fill: "#82ca9d", r: 6 }}
              label={{
                position: "top",
                formatter: (value) => `₺${(value / 1000).toFixed(1)}K`,
                fontSize: 11,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductSalesChart;
