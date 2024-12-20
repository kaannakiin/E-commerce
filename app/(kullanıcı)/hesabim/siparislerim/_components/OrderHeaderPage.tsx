"use client";
import React, { use } from "react";
import { Group, Select, TextInput } from "@mantine/core";
import { FaSearch, FaSort } from "react-icons/fa";
import { useDebouncedCallback } from "@mantine/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
const OrderHeaderPage = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL'den mevcut search değerini al
  const currentSearch = searchParams.get("search") || "";

  const onTextChange = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchValue = e.target.value;
      const params = new URLSearchParams(searchParams);

      if (searchValue && searchValue.length >= 5) {
        params.set("search", searchValue);
        router.replace(`${pathname}?${params.toString()}`);
      } else if (!searchValue) {
        params.delete("search");
        router.replace(`${pathname}?${params.toString()}`);
      }
    },
    500,
  );

  const onSelectChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("orderBy", value);
    } else {
      params.delete("orderBy");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-6 w-full">
      <Group gap="md" grow>
        <TextInput
          placeholder="En az 5 karakter giriniz..."
          leftSection={<FaSearch size={14} />}
          defaultValue={currentSearch} // Mevcut değeri göster
          onChange={onTextChange}
          styles={{
            input: {
              "&:focus": {
                borderColor: "#228be6",
              },
            },
          }}
        />
        <Select
          placeholder="Sıralama"
          leftSection={<FaSort size={14} />}
          onChange={onSelectChange}
          value={searchParams.get("orderBy") || ""} // Mevcut sıralama değerini göster
          data={[
            { value: "date-desc", label: "En Yeni Siparişler" },
            { value: "date-asc", label: "En Eski Siparişler" },
            { value: "price-desc", label: "Fiyat: Yüksekten Düşüğe" },
            { value: "price-asc", label: "Fiyat: Düşükten Yükseğe" },
          ]}
          styles={{
            input: {
              "&:focus": {
                borderColor: "#228be6",
              },
            },
          }}
        />
      </Group>
    </div>
  );
};
export default OrderHeaderPage;
