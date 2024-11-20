"use client";

import { Select, Button, Group, Title } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import SearchInput from "@/components/SearchBar";
import { useState } from "react";

interface DiscountHeaderProps {
  className?: string;
}

const DiscountHeader = ({ className }: DiscountHeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterType, setFilterType] = useState(
    searchParams.get("type") || "all",
  );

  const handleNewCoupon = () => {
    router.push("/admin/indirim-kodu/yeni");
  };

  const handleFilterChange = (value: string | null) => {
    if (value) {
      setFilterType(value);
      router.push(`/admin/indirim-kodu?type=${value}`);
    }
  };

  return (
    <Group className={`flex flex-wrap gap-3 ${className}`}>
      <Button
        leftSection={<FiPlus size={18} />}
        variant="filled"
        onClick={handleNewCoupon}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-200 hover:from-blue-700 hover:to-blue-800 md:w-[200px]"
      >
        Yeni Kupon Oluştur
      </Button>

      <Select
        value={filterType}
        onChange={handleFilterChange}
        data={[
          { value: "all", label: "Tüm Kuponlar" },
          { value: "unexpired", label: "Aktif Kuponlar" },
          { value: "expired", label: "Geçersiz Kuponlar" },
        ]}
        className="w-full md:w-[200px]"
        size="md"
      />

      <SearchInput
        className="w-full md:w-1/3"
        placeholder="Kod ara"
        withPagination={false}
      />
    </Group>
  );
};

export default DiscountHeader;
