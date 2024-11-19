import { formattedPrice } from "@/lib/format";
import { Card, Group, UnstyledButton } from "@mantine/core";
import { formatDate } from "date-fns";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import OrderStatusDisplay from "./OrderStatus";

const OrderHeader = ({
  createdAt,
  orderStatus,
  orderNumber,
  paidPrice,
  quantitySum,
  href,
  orderDetail,
}: {
  createdAt: Date;
  orderStatus: string;
  orderNumber: string;
  paidPrice: number;
  quantitySum?: number;
  href?: string;
  orderDetail?: boolean;
}) => {
  return (
    <Card
      withBorder
      radius="sm"
      shadow="sm"
      bg="gray.1"
      p="md"
      className="flex flex-col gap-6"
    >
      {/* Header Section with Flex Layout */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 sm:items-center">
          <h2 className="text-xl font-bold">Sipariş Detayı</h2>
          {orderDetail && (
            <UnstyledButton
              component={Link}
              href={href}
              className="relative overflow-hidden px-5 py-2 text-blue-500 transition-colors duration-500 before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0 before:bg-primary-400 before:transition-all before:duration-300 after:absolute after:bottom-0 after:right-1/2 after:h-0.5 after:w-0 after:bg-primary-400 after:transition-all after:duration-300 hover:text-primary-600 hover:before:left-0 hover:before:w-1/2 hover:after:right-0 hover:after:w-1/2"
            >
              <span>Sipariş Detayı</span>
            </UnstyledButton>
          )}
        </div>
        <OrderStatusDisplay status={orderStatus} deliveredAt={createdAt} />
      </div>

      {/* Info Grid - Responsive Layout */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <InfoItem label="Sipariş Numarası" value={orderNumber} />
        <InfoItem
          label="Sipariş Tarihi"
          value={formatDate(new Date(createdAt), "dd/MM/yyyy")}
        />
        <InfoItem
          label="Tutar"
          value={formattedPrice(paidPrice)}
          valueClassName="text-green-600"
        />
        <InfoItem label="Sipariş Özeti" value={`${quantitySum} ürün`} />
      </div>
    </Card>
  );
};

const InfoItem = ({ label, value, valueClassName = "" }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-gray-500">{label}</span>
    <span className={`font-medium ${valueClassName}`}>{value}</span>
  </div>
);

export default OrderHeader;
