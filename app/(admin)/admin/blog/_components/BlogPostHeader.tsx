"use client";
import { Button, Select, TextInput } from "@mantine/core";
import React from "react";
import { CiSearch } from "react-icons/ci";
import { useDebouncedCallback } from "@mantine/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IoIosAdd } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";

const BlogPostHeader = () => {
  const params = useSearchParams();
  const pathname = usePathname();
  const { replace, push } = useRouter();

  const dateRangeOptions = [
    { value: "today", label: "Bugün" },
    { value: "yesterday", label: "Dün" },
    { value: "last7days", label: "Son 7 Gün" },
    { value: "last30days", label: "Son 30 Gün" },
    { value: "thisMonth", label: "Bu Ay" },
    { value: "lastMonth", label: "Geçen Ay" },
    { value: "thisYear", label: "Bu Yıl" },
    { value: "lastYear", label: "Geçen Yıl" },
  ];

  const onSearch = useDebouncedCallback((value: string) => {
    try {
      const searchParams = new URLSearchParams(params);

      if (value === "") {
        searchParams.delete("search");
      } else {
        searchParams.set("search", value);
      }

      replace(`${pathname}?${searchParams.toString()}`);
    } catch (error) {
      console.error("Search params error:", error);
    }
  }, 500);

  const handleDateRangeChange = (value: string | null) => {
    const searchParams = new URLSearchParams(params);
    if (value) {
      searchParams.set("dateRange", value);
    } else {
      searchParams.delete("dateRange");
    }
    replace(`${pathname}?${searchParams.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 px-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="grid w-full grid-cols-1 gap-4 sm:w-1/2 lg:grid-cols-2">
        <TextInput
          placeholder="Tabloda arama yapabilirsiniz"
          onChange={(event) => onSearch(event.currentTarget.value)}
          rightSection={<CiSearch />}
          defaultValue={params.get("search") || ""}
        />
        <Select
          placeholder="Tarih Aralığı"
          data={dateRangeOptions}
          value={params.get("dateRange") || ""}
          onChange={handleDateRangeChange}
          clearable
        />
      </div>
      <Button
        className="w-full sm:w-auto"
        rightSection={<IoMdAdd size={20} />}
        onClick={() => push("/admin/blog/yeni")}
      >
        Blog Yazısı Ekle
      </Button>
    </div>
  );
};

export default BlogPostHeader;
