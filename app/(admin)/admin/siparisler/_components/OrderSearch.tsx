import SearchInput from "@/components/SearchBar";
import { Group, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { OrderStatus } from "@prisma/client";
import "dayjs/locale/tr";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OrderSearchHeader = () => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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
      newParams.set("page", "1");
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
      <SearchInput
        className="w-1/4"
        placeholder="Sipariş Numarası ile arama yapabilirsiniz."
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
            { value: OrderStatus.PENDING, label: "Beklemede" },
            { value: OrderStatus.PROCESSING, label: "İşleniyor" },
            { value: OrderStatus.SHIPPED, label: "Kargoya Verildi" },
            { value: OrderStatus.CANCELLED, label: "İptal Edildi" },
            { value: OrderStatus.COMPLETED, label: "Tamamlandı" },
          ].map((option) => ({
            ...option,
            disabled: option.value === params.get("status"),
          }))}
          value={params.get("status") || "all"}
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
