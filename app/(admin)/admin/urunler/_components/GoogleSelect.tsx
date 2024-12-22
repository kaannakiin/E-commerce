"use client";
import { Loader, MultiSelect, Select } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";
import { Controller } from "react-hook-form";

interface Category {
  id: number;
  name: string;
  level: number;
  fullPath: string;
  parentPath: string;
  breadcrumbs: string[];
}

interface CategoryOption {
  value: string;
  label: string;
  description: string;
  level: number;
}

interface SearchResponse {
  success: boolean;
  data?: Category[];
  error?: string;
}

interface Props {
  control;
  initialCategories?: Category[];
  onSearch: (term: string) => Promise<SearchResponse>;
  multiple?: boolean;
}

const GoogleCategorySelector = ({
  control,
  initialCategories = [],
  onSearch,
  multiple = false,
}: Props) => {
  const [isSearching, setIsSearching] = useState(false);

  const processCategories = useCallback(
    (categories: Category[]): CategoryOption[] => {
      return categories?.map((cat) => ({
        value: cat.id.toString(),
        label: cat.name,
        description: cat.fullPath,
        level: cat.level,
      }));
    },
    [],
  );

  // Sonra state'i tanımla
  const [searchResults, setSearchResults] = useState<CategoryOption[]>(() =>
    processCategories(initialCategories),
  );

  useEffect(() => {
    if (initialCategories?.length > 0) {
      setSearchResults(processCategories(initialCategories));
    }
  }, [initialCategories, processCategories]);

  const debouncedSearch = useDebouncedCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim() === "") {
      setSearchResults(processCategories(initialCategories));
      return;
    }

    setIsSearching(true);
    try {
      const response = await onSearch(searchTerm);
      if (response.success && response.data) {
        setSearchResults(processCategories(response.data));
      } else {
        console.error("Search failed:", response.error);
        setSearchResults(processCategories(initialCategories));
      }
    } catch (error) {
      console.error("Detailed Search error:", error);
      setSearchResults(processCategories(initialCategories));
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const SelectComponent = multiple ? MultiSelect : Select;

  return (
    <Controller
      name="googleCategories"
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <SelectComponent
          data={searchResults}
          value={value}
          onChange={onChange}
          searchable
          clearable
          withAsterisk
          label="Google Ürün Kategorisi"
          description="Ürününüze en uygun kategoriyi aradığınıza emin olun. Alt Kategorileri seçmek için tekrar kontrol edin."
          error={error?.message}
          placeholder="Kategori seçin..."
          rightSection={isSearching ? <Loader size="xs" /> : null}
          onSearchChange={debouncedSearch}
          maxDropdownHeight={400}
        />
      )}
    />
  );
};

export default GoogleCategorySelector;
