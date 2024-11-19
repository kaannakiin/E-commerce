import { prisma } from "@/lib/prisma";
import {
  Alert,
  Badge,
  Box,
  Group,
  ScrollArea,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Tooltip,
} from "@mantine/core";
import { DiscountCode, DiscountType, Prisma } from "@prisma/client";
import { cache } from "react";
import { FiCalendar, FiHash, FiRepeat } from "react-icons/fi";
import { IoAlert } from "react-icons/io5";
import ToggleActionMenu from "./ToggleActionMenu";
type DiscountTableProps = {
  type: "expired" | "unexpired";
};

const WHERE_EXPIRED: Prisma.DiscountCodeWhereInput = {
  OR: [
    { limit: { not: null, lte: prisma.discountCode.fields.uses } },
    { expiresAt: { not: null, lte: new Date() } },
  ],
};
const getExpiredDiscountCodes = cache(async () => {
  try {
    return await prisma.discountCode.findMany({
      where: WHERE_EXPIRED,
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching expired discount codes:", error);
    throw new Error("İndirim kodları yüklenirken bir hata oluştu.");
  }
});
const getUnExpiredDiscountCodes = cache(async () => {
  try {
    return await prisma.discountCode.findMany({
      where: { NOT: WHERE_EXPIRED },
    });
  } catch (error) {}
});

const DiscountTable = async ({ type }: DiscountTableProps) => {
  const columnWidths = {
    code: "15%",
    discount: "15%",
    usage: "12%",
    limit: "12%",
    expiry: "22%",
    status: "12%",
    actions: "12%",
  };
  let discountCodes: DiscountCode[] = [];
  let error: Error | null = null;
  try {
    discountCodes = await (type === "expired"
      ? getExpiredDiscountCodes()
      : getUnExpiredDiscountCodes());
  } catch (e) {
    error = e as Error;
  }

  if (error) {
    return (
      <Alert icon={<IoAlert size={16} />} title="Hata" color="red">
        {error.message}
      </Alert>
    );
  }

  if (!discountCodes.length) {
    return (
      <Alert icon={<IoAlert size={16} />} title="Bilgi" color="blue">
        {type === "expired"
          ? "Pasif indirim kodu bulunmamaktadır."
          : "Aktif indirim kodu bulunmamaktadır."}
      </Alert>
    );
  }

  const getStatusBadge = (discount: DiscountCode) => {
    if (type === "expired") {
      return (
        <Badge color="red">
          {discount.limit !== null && discount.uses >= discount.limit
            ? "Limiti Doldu"
            : "Süresi Doldu"}
        </Badge>
      );
    }
    if (discount.active) {
      return <Badge color="green">Aktif</Badge>;
    }
    return <Badge color="red">Pasif</Badge>;
  };

  const getDiscountBadge = (discount: DiscountCode) => {
    const color =
      discount.discountType === DiscountType.PERCENTAGE ? "blue" : "green";
    return (
      <Badge color={color} variant="light">
        {discount.discountAmount}
        {discount.discountType === DiscountType.PERCENTAGE ? "%" : "₺"}
      </Badge>
    );
  };

  return (
    <Box className="w-full">
      <h1 className="my-2 text-sm text-gray-600">
        {type == "expired" ? "Süresi dolmuş ve limiti bitmiş" : "Aktif"} İndirim
        Kodları
      </h1>
      <ScrollArea>
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          className="min-w-[800px]"
        >
          <TableThead>
            <TableTr>
              <TableTh style={{ width: columnWidths.code }}>Kod</TableTh>
              <TableTh style={{ width: columnWidths.discount }}>
                İndirim
              </TableTh>
              <TableTh style={{ width: columnWidths.usage }}>Kullanım</TableTh>
              <TableTh style={{ width: columnWidths.limit }}>Limit</TableTh>
              <TableTh style={{ width: columnWidths.expiry }}>
                Son Kullanım
              </TableTh>
              <TableTh style={{ width: columnWidths.status }}>Durum</TableTh>
              <TableTh style={{ width: columnWidths.actions }}>
                İşlemler
              </TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {discountCodes.map((discount) => (
              <TableTr key={discount.id}>
                <TableTd style={{ width: columnWidths.code }}>
                  <Text
                    fw={500}
                    size="sm"
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {discount.code}
                  </Text>
                </TableTd>
                <TableTd style={{ width: columnWidths.discount }}>
                  {getDiscountBadge(discount)}
                </TableTd>
                <TableTd style={{ width: columnWidths.usage }}>
                  <Group gap="xs" wrap="nowrap">
                    <FiRepeat
                      size={16}
                      className="flex-shrink-0 text-gray-500"
                    />
                    <Text size="sm" className="whitespace-nowrap">
                      {discount.uses}
                    </Text>
                  </Group>
                </TableTd>
                <TableTd style={{ width: columnWidths.limit }}>
                  <Tooltip label="Kullanım Limiti">
                    <Group gap="xs" wrap="nowrap">
                      <FiHash
                        size={16}
                        className="flex-shrink-0 text-gray-500"
                      />
                      <Text size="sm" className="whitespace-nowrap">
                        {discount.limit || "Limitsiz"}
                      </Text>
                    </Group>
                  </Tooltip>
                </TableTd>
                <TableTd style={{ width: columnWidths.expiry }}>
                  <Tooltip label="Son Kullanım Tarihi">
                    <Group gap="xs" wrap="nowrap">
                      <FiCalendar
                        size={16}
                        className="flex-shrink-0 text-gray-500"
                      />
                      <Text size="sm" className="whitespace-nowrap">
                        {discount.expiresAt
                          ? new Date(discount.expiresAt).toLocaleDateString(
                              "tr-TR",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )
                          : "Süresiz"}
                      </Text>
                    </Group>
                  </Tooltip>
                </TableTd>
                <TableTd style={{ width: columnWidths.status }}>
                  {getStatusBadge(discount)}
                </TableTd>
                <TableTd
                  style={{ width: columnWidths.actions }}
                  className="text-right"
                >
                  <ToggleActionMenu
                    isExpired={type == "expired"}
                    discountId={discount.id}
                    isActive={discount.active}
                  />
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </ScrollArea>
    </Box>
  );
};

export default DiscountTable;
