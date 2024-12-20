"use client";
import React, { useMemo } from "react";
import {
  TextInput,
  Group,
  SegmentedControl,
  Select,
  Button,
  Paper,
  Stack,
  Box,
} from "@mantine/core";
import { BiSearch, BiFilterAlt } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { useDebouncedCallback } from "@mantine/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TableSearch = () => {
  const params = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleParams = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(params.toString());
    if (value && value !== "all") {
      newParams.set("page", "1");
      newParams.set(key, value);
    } else {
      newParams.delete(key);
      if (key === "search") newParams.delete("page");
    }
    replace(`${pathname}?${newParams.toString()}`);
  };

  const onInputChange = useDebouncedCallback((value) => {
    handleParams("search", value);
  }, 300);

  const onSegmentedChange = (value: string) => {
    handleParams("status", value);
  };

  const onSelectChange = (value: string) => {
    handleParams("sort", value);
  };

  const activeFilterCount = useMemo(() => {
    const filterParams = ["search", "status", "sort"];
    return filterParams.filter((param) => params.has(param)).length;
  }, [params]);

  const clearFilters = () => {
    const newParams = new URLSearchParams(params.toString());
    ["search", "status", "sort"].forEach((param) => newParams.delete(param));
    replace(`${pathname}?${newParams.toString()}`);
  };

  return (
    <Paper p="xs" withBorder mb="md">
      <Box
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          alignItems: "start",
          "@media (min-width: 900px)": {
            gridTemplateColumns: "2fr 1.5fr 1fr",
          },
        }}
      >
        <TextInput
          placeholder="Ürün ara..."
          defaultValue={params.get("search") || ""}
          onChange={(e) => onInputChange(e.target.value)}
          leftSection={<BiSearch size={16} />}
        />

        <SegmentedControl
          fullWidth
          value={params.get("status") || "all"}
          data={[
            { label: "Tümü", value: "all" },
            { label: "Aktif", value: "active" },
            { label: "Pasif", value: "inactive" },
          ]}
          defaultValue="all"
          onChange={onSegmentedChange}
          style={{ maxWidth: "100%" }}
        />

        <Select
          placeholder="Sıralama"
          value={params.get("sort") || "newest"}
          data={[
            { label: "En yeni", value: "newest" },
            { label: "En eski", value: "oldest" },
            { label: "İsme göre (A-Z)", value: "name_asc" },
            { label: "İsme göre (Z-A)", value: "name_desc" },
            { label: "Stok: Azalan", value: "stock_desc" },
            { label: "Stok: Artan", value: "stock_asc" },
          ]}
          onChange={onSelectChange}
          clearable
          onClear={() => handleParams("sort", "newest")}
        />
      </Box>

      {activeFilterCount > 0 && (
        <Box mt="xs">
          <Button
            variant="subtle"
            size="xs"
            color="red"
            leftSection={<IoClose size={14} />}
            onClick={clearFilters}
          >
            Filtreleri Temizle ({activeFilterCount})
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default TableSearch;
