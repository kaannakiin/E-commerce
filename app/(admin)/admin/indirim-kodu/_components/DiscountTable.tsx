import {
  Alert,
  Badge,
  Box,
  Group,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { DiscountCode, DiscountType as Type } from "@prisma/client";
import { FiCalendar, FiHash, FiRepeat } from "react-icons/fi";
import { IoAlert } from "react-icons/io5";
import ToggleActionMenu from "./ToggleActionMenu";
import { DiscountType } from "../page";
import { format, isAfter } from "date-fns";
import { tr } from "date-fns/locale";

export interface DiscountStatus {
  color: string;
  label: string;
  isExpired: boolean;
  isLimitReached: boolean;
  isInactive: boolean;
}

interface DiscountTableProps {
  type: DiscountType;
  coupons: DiscountCode[];
}

const DiscountTable = ({ type, coupons }: DiscountTableProps) => {
  const formatDate = (date: Date | null) => {
    if (!date) return <Badge size="md">Süresiz</Badge>;
    return format(new Date(date), "EEEE, dd MMMM yyyy HH:mm", { locale: tr });
  };

  const getDiscountStatus = (discount: DiscountCode): DiscountStatus => {
    const now = new Date();
    const isExpired =
      discount.expiresAt && !isAfter(new Date(discount.expiresAt), now);
    const isLimitReached =
      discount.limit !== null && discount.uses >= discount.limit;
    const isInactive = !discount.active;

    let label = "Aktif";
    let color = "green";

    if (isInactive) {
      label = "Pasif";
      color = "red";
    } else if (isExpired && isLimitReached) {
      label = "Süresi ve Limiti Doldu";
      color = "red";
    } else if (isExpired) {
      label = "Süresi Doldu";
      color = "red";
    } else if (isLimitReached) {
      label = "Limiti Doldu";
      color = "red";
    }

    return {
      color,
      label,
      isExpired,
      isLimitReached,
      isInactive,
    };
  };

  const getDiscountBadge = (discount: DiscountCode) => {
    const isPercentage = discount.discountType === Type.PERCENTAGE;
    return (
      <Badge
        color={isPercentage ? "blue" : "teal"}
        variant="light"
        size="lg"
        className="min-w-[60px] px-3 text-center font-semibold"
      >
        {discount.discountAmount}
        {isPercentage ? "%" : "₺"}
      </Badge>
    );
  };

  if (!coupons.length) {
    return (
      <Alert
        icon={<IoAlert size={16} />}
        title="Bilgi"
        color="blue"
        className="rounded-lg shadow-sm"
      >
        {type === "expired"
          ? "Süresi/limiti dolmuş kupon bulunmamaktadır."
          : "Aktif kupon bulunmamaktadır."}
      </Alert>
    );
  }

  return (
    <div className="flex w-full flex-col space-y-4">
      {/* Header Section */}
      <div className="flex flex-col space-y-2 px-4 sm:px-6">
        <Text component="h2" size="lg" className="font-semibold text-gray-900">
          İndirim Kodları
        </Text>
        <Text size="sm" className="text-gray-600">
          {type === "expired"
            ? "Süresi dolmuş ve limiti bitmiş"
            : type === "unexpired"
              ? "Aktif"
              : "Tüm"}{" "}
          indirim kodlarının listesi
        </Text>
      </div>

      {/* Table Section */}
      <div className="relative rounded-lg border border-gray-200 bg-white shadow-sm">
        <ScrollArea className="hidden lg:flex">
          <div className="min-w-full">
            <Table
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders={false}
              horizontalSpacing="lg"
              verticalSpacing="md"
            >
              <thead>
                <tr className="bg-gray-50">
                  {[
                    "Kod",
                    "İndirim",
                    "Kullanım",
                    "Limit",
                    "Son Kullanım",
                    "Durum",
                    "İşlemler",
                  ].map((header) => (
                    <th
                      key={header}
                      className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((discount) => {
                  const status = getDiscountStatus(discount);

                  return (
                    <tr
                      key={discount.id}
                      className="group transition-colors duration-150 hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <Text
                          fw={600}
                          size="sm"
                          className="font-mono text-gray-800"
                        >
                          {discount.code}
                        </Text>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getDiscountBadge(discount)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Group gap="xs" wrap="nowrap">
                          <FiRepeat size={16} className="text-gray-400" />
                          <Text size="sm" fw={500} className="text-gray-700">
                            {discount.uses}
                          </Text>
                        </Group>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Tooltip label="Kullanım Limiti">
                          <Group gap="xs" wrap="nowrap">
                            <FiHash size={16} className="text-gray-400" />
                            {discount.limit !== null ? (
                              <Text
                                size="sm"
                                fw={500}
                                className="text-gray-700"
                              >
                                {discount.limit}
                              </Text>
                            ) : (
                              <Badge size="md">Limitsiz</Badge>
                            )}
                          </Group>
                        </Tooltip>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Tooltip label="Son Kullanım Tarihi">
                          <Group gap="xs" wrap="nowrap">
                            <FiCalendar size={16} className="text-gray-400" />
                            <Text size="sm" fw={500} className="text-gray-700">
                              {formatDate(discount.expiresAt)}
                            </Text>
                          </Group>
                        </Tooltip>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge
                          color={status.color}
                          variant={status.color === "red" ? "filled" : "light"}
                          size="md"
                          className="min-w-[100px] text-center font-medium"
                        >
                          {status.label}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex justify-end">
                          <ToggleActionMenu
                            discountId={discount.id}
                            isActive={discount.active}
                            status={{
                              isExpired: status.isExpired,
                              isLimitReached: status.isLimitReached,
                              isInactive: status.isInactive,
                              label: status.label,
                              color: status.color,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </ScrollArea>

        {/* Mobile Responsive Cards */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {coupons.map((discount) => {
              const status = getDiscountStatus(discount);

              return (
                <div key={discount.id} className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <Text
                      fw={600}
                      size="sm"
                      className="font-mono text-gray-800"
                    >
                      {discount.code}
                    </Text>
                    <ToggleActionMenu
                      discountId={discount.id}
                      isActive={discount.active}
                      status={{
                        isExpired: status.isExpired,
                        isLimitReached: status.isLimitReached,
                        isInactive: status.isInactive,
                        label: status.label,
                        color: status.color,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text size="xs" className="text-gray-500">
                        İndirim
                      </Text>
                      {getDiscountBadge(discount)}
                    </div>
                    <div>
                      <Text size="xs" className="text-gray-500">
                        Durum
                      </Text>
                      <Badge
                        color={status.color}
                        variant={status.color === "red" ? "filled" : "light"}
                        size="md"
                        className="min-w-[100px] text-center font-medium"
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <div>
                      <Text size="xs" className="text-gray-500">
                        Kullanım
                      </Text>
                      <Group gap="xs" wrap="nowrap">
                        <FiRepeat size={16} className="text-gray-400" />
                        <Text size="sm" fw={500} className="text-gray-700">
                          {discount.uses}
                        </Text>
                      </Group>
                    </div>
                    <div>
                      <Text size="xs" className="text-gray-500">
                        Limit
                      </Text>
                      <Group gap="xs" wrap="nowrap">
                        <FiHash size={16} className="text-gray-400" />
                        <Text size="sm" fw={500} className="text-gray-700">
                          {discount.limit !== null ? (
                            <Text size="sm" fw={500} className="text-gray-700">
                              {discount.limit}
                            </Text>
                          ) : (
                            <Badge size="md">Limitsiz</Badge>
                          )}
                        </Text>
                      </Group>
                    </div>
                  </div>

                  <div>
                    <Text size="xs" className="text-gray-500">
                      Son Kullanım
                    </Text>
                    <Group gap="xs" wrap="nowrap">
                      <FiCalendar size={16} className="text-gray-400" />
                      <Text size="sm" fw={500} className="text-gray-700">
                        {formatDate(discount.expiresAt)}
                      </Text>
                    </Group>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountTable;
