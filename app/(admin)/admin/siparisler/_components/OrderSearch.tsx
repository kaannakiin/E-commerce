import { Group, Select, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDebouncedCallback } from "@mantine/hooks";
import { OrderStatus } from "@prisma/client";
import "dayjs/locale/tr";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { FaSearch } from "react-icons/fa";

const OrderSearchHeader = () => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inputOnChange = useDebouncedCallback((e) => {
    const newParams = new URLSearchParams(params.toString());
    if (e) {
      newParams.set("search", e.trim());
    } else {
      newParams.delete("search");
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  }, 800);

  const dateOnChange = (dates: [Date | null, Date | null]) => {
    const newParams = new URLSearchParams(params.toString());
    const isValidDateRange =
      dates &&
      Array.isArray(dates) &&
      dates.length === 2 &&
      dates[0] instanceof Date &&
      dates[1] instanceof Date;
    if (isValidDateRange) {
      newParams.set("startDate", dates[0].toISOString());
      newParams.set("endDate", dates[1].toISOString());
    } else {
      newParams.delete("startDate");
      newParams.delete("endDate");
    }

    router.replace(`${pathname}?${newParams.toString()}`);
  };
  const onSelectChange = (value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value && value !== "all") {
      newParams.set("status", value);
    } else {
      newParams.delete("status");
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };
  return (
    <Group
      align="center"
      p="md"
      justify="space-between"
      style={{ backgroundColor: "white" }}
      className="w-full"
    >
      <TextInput
        placeholder="Sipariş numarası, müşteri adı, e-posta"
        rightSection={<FaSearch size={14} />}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          inputOnChange(e.currentTarget.value);
        }}
        styles={{
          input: {
            backgroundColor: "#f8f9fa",
            border: "none",
            "&:focus": {
              border: "1px solid #228be6",
            },
          },
        }}
        className="lg:w-1/3"
      />
      <div className="flex flex-col justify-end gap-5 lg:flex-1 lg:flex-row">
        <DatePickerInput
          type="range"
          placeholder="Tarih aralığı seçiniz"
          valueFormat="DD/MM/YYYY"
          locale="tr"
          onChange={(value) => {
            dateOnChange(value as [Date | null, Date | null]);
          }}
          clearable
          hideOutsideDates
          maxDate={new Date()}
          styles={{
            input: {
              minWidth: "200px",
              border: "none",
              backgroundColor: "#f8f9fa",
              "&:focus": {
                border: "1px solid #228be6",
              },
            },
          }}
        />

        <Select
          data={[
            { value: "all", label: "Tümü" },
            { value: OrderStatus.PENDING, label: "Onay bekliyor" },
            { value: OrderStatus.PROCESSING, label: "Onaylandı" },
            { value: OrderStatus.SHIPPED, label: "Kargoya verildi" },
            { value: OrderStatus.DELIVERED, label: "Tamamlandı" },
            { value: OrderStatus.CANCELLED, label: "İptal edildi" },
          ].map((option) => ({
            ...option,
            disabled: option.value === params.get("status"), // URL'den mevcut değeri al
          }))}
          value={params.get("status") || "all"} // URL'den değeri al, yoksa 'all'
          onChange={onSelectChange}
          styles={{
            input: {
              border: "none",
              backgroundColor: "#f8f9fa",
              "&:focus": {
                border: "1px solid #228be6",
              },
            },
          }}
        />
      </div>
    </Group>
  );
};

export default OrderSearchHeader;
