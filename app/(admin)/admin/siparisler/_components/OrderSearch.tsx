import SearchInput from "@/components/SearchBar";
import { Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { OrderStatus, PaymentType } from "@prisma/client";
import "dayjs/locale/tr";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaRegCalendarAlt } from "react-icons/fa";

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
  const onSelectPaymentChange = (value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value && value !== "allPayment") {
      newParams.set("page", "1");
      newParams.set("pm", value);
    } else {
      newParams.delete("pm");
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };
  return (
    <div
      style={{ backgroundColor: "white" }}
      className="flex w-full flex-col py-5 lg:flex-row"
    >
      <SearchInput
        className="w-full pb-5 lg:w-1/4"
        placeholder="Sipariş numarası, kullanıcı adı, e-posta"
      />
      <div className="flex flex-col justify-end gap-5 lg:flex-1 lg:flex-row">
        <Select
          allowDeselect
          data={[
            { value: "allPayment", label: "Tüm Ödeme Yöntemleri" },
            { value: "bankTransfer", label: "Havale / EFT" },
            {
              value: "creditcards",
              label: "Kredi Kartı",
            },
          ]}
          styles={{
            input: {
              border: "none",
              backgroundColor: "#f8f9fa",
              "&:focus": {
                border: "1px solid #228be6",
              },
            },
          }}
          value={params.get("pm") || "allPayment"}
          onChange={onSelectPaymentChange}
        />
        <DatePickerInput
          type="range"
          placeholder="Tarih aralığı seçiniz"
          valueFormat="DD/MM/YYYY"
          locale="tr"
          variant="filled"
          onChange={(value) => {
            dateOnChange(value as [Date | null, Date | null]);
          }}
          clearable
          leftSection={<FaRegCalendarAlt />}
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
          allowDeselect
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
    </div>
  );
};

export default OrderSearchHeader;
