"use client";
import { TextInput, UnstyledButton } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import React from "react";

interface SearchInputProps {
  className?: string;
  placeholder?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  debounceMs?: number;
  searchKey?: string;
  withPagination?: boolean;
}

const SearchInput = ({
  className = "",
  placeholder = "Ara...",
  size = "sm",
  debounceMs = 800,
  searchKey = "search",
  withPagination = true,
}: SearchInputProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const updateSearch = useDebouncedCallback((value: string) => {
    const current = new URLSearchParams(Array.from(params.entries()));

    if (value) {
      current.set(searchKey, value);
      if (withPagination) {
        current.set("page", "1");
      }
    } else {
      current.delete(searchKey);
    }

    const queryString = current.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`);
  }, debounceMs);

  return (
    <TextInput
      className={className}
      placeholder={placeholder}
      size={size}
      classNames={{ root: "w-full" }}
      defaultValue={params.get(searchKey) ?? ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        updateSearch(e.currentTarget.value)
      }
      rightSection={
        <UnstyledButton>
          <FaSearch className="text-gray-400" />
        </UnstyledButton>
      }
    />
  );
};

export default SearchInput;
