"use client";
import { Card, Select } from "@mantine/core";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";
import { CiCalendar } from "react-icons/ci";

const HomePageHeader = () => {
  const params = useSearchParams();
  const router = useRouter();
  const dayOptions = [
    { value: "today", label: "Bugün" },
    { value: "yesterday", label: "Dün" },
    { value: "thisWeek", label: "Bu hafta" },
    { value: "lastWeek", label: "Geçen hafta" },
    { value: "thisMonth", label: "Bu ay" },
    { value: "lastMonth", label: "Geçen ay" },
    { value: "7", label: "Son 7 gün" },
    { value: "14", label: "Son 14 gün" },
    { value: "30", label: "Son 30 gün" },
    { value: "90", label: "Son 90 gün" },
    { value: "all", label: "Tüm zamanlar" },
  ];
  const onChange = async (data) => {
    const searchParams = new URLSearchParams(params.toString());
    searchParams.set("range", data);
    router.push(`?${searchParams.toString()}`);
  };
  return (
    <Card
      shadow="xs"
      withBorder
      bg={"primary.1"}
      p={"xs"}
      className="flex flex-row justify-between"
    >
      <Select
        data={dayOptions}
        defaultValue="7"
        variant="filled"
        radius={"xl"}
        value={params.get("range") || "7"}
        onChange={(event) => {
          onChange(event);
        }}
        leftSection={
          <CiCalendar color="black" className="font-bold" size={24} />
        }
        comboboxProps={{
          transitionProps: { transition: "pop", duration: 200 },
        }}
      />
    </Card>
  );
};

export default HomePageHeader;
