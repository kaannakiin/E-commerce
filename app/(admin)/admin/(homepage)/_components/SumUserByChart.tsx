"use client";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface UserChartDataPoint {
  date: string;
  totalUsers: number;
  newUsers: number;
}

interface UserChartData {
  dailyUsers: UserChartDataPoint[];
  totalUsers: number;
  usersInDateRange: number;
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

  const totalUsers = payload[0]?.value;
  const newUsers = payload[1]?.value;

  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-lg">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <p className="text-sm text-gray-600">
        Toplam Kullanıcı:{" "}
        <span className="font-medium">
          {totalUsers !== undefined ? totalUsers : "Yükleniyor..."}
        </span>
      </p>
      <p className="text-sm text-gray-600">
        Yeni Kullanıcı:{" "}
        <span className="font-medium">
          {newUsers !== undefined ? newUsers : "Yükleniyor..."}
        </span>
      </p>
    </div>
  );
};

const SumUserByChart = ({ data }: { data: UserChartData }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm text-gray-500">Toplam Kullanıcı</h3>
          <p className="text-xl font-semibold">{data.totalUsers}</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm text-gray-500">
            Seçili Tarih Aralığında Yeni Kullanıcı
          </h3>
          <p className="text-xl font-semibold">{data.usersInDateRange}</p>
        </div>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.dailyUsers}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="newUsers"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Yeni Kullanıcı"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SumUserByChart;
