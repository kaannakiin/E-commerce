import { formattedPrice } from "@/lib/format";
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaUsers,
  FaUserPlus,
} from "react-icons/fa";

const StatsCards = ({ sales, totalUsers, weeklyUsersCount }) => {
  return (
    <div className="mb-4 flex w-full flex-col gap-4 md:flex-row">
      <div className="flex flex-1 rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <FaMoneyBillWave className="h-6 w-6 text-green-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Toplam Satış</p>
          <h3 className="text-xl font-bold text-gray-900">
            {formattedPrice(sales._sum.paidPrice)}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <FaShoppingCart className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Satış Adedi</p>
          <h3 className="text-xl font-bold text-gray-900">{sales._count}</h3>
        </div>
      </div>

      <div className="flex flex-1 rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
          <FaUsers className="h-6 w-6 text-purple-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Toplam Üye</p>
          <h3 className="text-xl font-bold text-gray-900">
            {totalUsers.toString()}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <FaUserPlus className="h-6 w-6 text-orange-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Yeni Üyeler</p>
          <h3 className="text-xl font-bold text-gray-900">
            {weeklyUsersCount.toString()}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
