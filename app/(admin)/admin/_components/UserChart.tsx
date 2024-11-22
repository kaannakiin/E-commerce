"use client";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
} from "recharts";

const UserChart = ({ userData }) => {
  return (
    <div className="flex h-[calc(100vh-400px)] flex-col rounded-lg bg-white p-2 shadow transition-shadow hover:shadow-lg lg:p-6">
      <h3 className="mb-2 text-lg font-semibold text-gray-700">
        Haftalık Üye Grafiği
      </h3>
      <div className="relative w-full flex-1 rounded-lg">
        <ResponsiveContainer className={"mx-auto my-auto flex h-full w-full"}>
          <BarChart data={userData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{
                fontSize: 11,
                fill: "#666",
                dy: 8,
              }}
              angle={-45}
              textAnchor="end"
              height={60}
              tickMargin={15}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              formatter={(value) => [value.toLocaleString(), ""]}
              contentStyle={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "8px",
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar
              dataKey="newUsers"
              name="Günlük Yeni Üye"
              fill="#82ca9d"
              radius={[4, 4, 0, 0]}
              label={({ value }) => (
                <text
                  x={0}
                  y={0}
                  dx={0}
                  dy={-6}
                  fill="#666"
                  fontSize={11}
                  textAnchor="middle"
                >
                  {value.toLocaleString()}
                </text>
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserChart;
