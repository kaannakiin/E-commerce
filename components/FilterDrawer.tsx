"use client";
import {
  Button,
  Divider,
  Drawer,
  Group,
  NumberInput,
  RangeSlider,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { VscClearAll, VscSettings } from "react-icons/vsc";

const FilterDrawer = ({ count }) => {
  const [open, setOpen] = useState(false);
  const [priceCollapsed, setPriceCollapsed] = useState(false);
  const [sortCollapsed, setSortCollapsed] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedSort, setSelectedSort] = useState(null);
  const [hasFilters, setHasFilters] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  useEffect(() => {
    const searchParams = new URLSearchParams(params);
    setHasFilters(searchParams.toString().length > 0);
  }, [params]);

  const handleApply = () => {
    const searchParams = new URLSearchParams(params);

    // Sıralama parametresi
    if (selectedSort) {
      searchParams.set("orderBy", selectedSort);
    } else {
      searchParams.delete("orderBy");
    }

    if (minPrice > 0) {
      searchParams.set("minPrice", minPrice.toString());
    } else {
      searchParams.delete("minPrice");
    }

    if (maxPrice < 10000) {
      searchParams.set("maxPrice", maxPrice.toString());
    } else {
      searchParams.delete("maxPrice");
    }

    searchParams.delete("page");

    const queryString = searchParams.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    router.push(newUrl);
    setOpen(false);
  };

  const handleReset = () => {
    setMinPrice(0);
    setMaxPrice(10000);
    setSelectedSort(null);

    router.push(pathname);
  };

  const sortOptions = [
    { label: "En Düşük Fiyat", value: "price-asc" },
    { label: "En Yüksek Fiyat", value: "price-desc" },
    { label: "En Yeniler", value: "newest" },
    { label: "Çok Satanlar", value: "best-seller" },
  ];
  const handleClearAll = () => {
    router.push(pathname);
  };
  return (
    <div className="w-full">
      <div className="flex flex-row items-center gap-4 py-2">
        <UnstyledButton
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2"
        >
          <VscSettings className="font-bold" />
          <span className="text-gray-700 transition-colors duration-200 hover:text-gray-900">
            Filtrele veya Sırala
          </span>
        </UnstyledButton>

        {hasFilters && (
          <UnstyledButton
            onClick={handleClearAll}
            className="flex items-center gap-1 text-primary-600 transition-colors duration-200 hover:text-primary-700"
          >
            <VscClearAll className="h-4 w-4" />
            <span className="text-xs font-medium">Filtreleri Temizle</span>
          </UnstyledButton>
        )}
      </div>

      <Drawer.Root
        opened={open}
        onClose={() => setOpen(false)}
        position="left"
        size={mobile ? "calc(100% - 40px)" : "25%"}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title className="text-lg font-semibold text-gray-800">
              Filtrele veya Sırala {count && `(${count})`} Ürün
            </Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Divider mb={30} />
          <Drawer.Body className="space-y-6">
            {/* Fiyat Filtresi */}
            <div>
              <UnstyledButton
                onClick={() => setPriceCollapsed((prev) => !prev)}
                className="group flex w-full items-center justify-between py-2"
              >
                <span className="font-semibold uppercase group-hover:text-gray-900">
                  Fiyat Aralığı
                </span>
                <IoMdAdd
                  className={`h-4 w-4 transition-transform duration-300 ${
                    priceCollapsed ? "rotate-45" : "rotate-0"
                  }`}
                />
              </UnstyledButton>

              {priceCollapsed && (
                <div className="mt-4 space-y-4">
                  <Group className="gap-2">
                    <NumberInput
                      label="Min Fiyat"
                      value={minPrice}
                      onChange={(value) => setMinPrice(Number(value))}
                      min={0}
                      max={maxPrice}
                      decimalScale={2}
                      step={50}
                      suffix=" ₺"
                      className="flex-1"
                    />
                    <NumberInput
                      label="Max Fiyat"
                      value={maxPrice}
                      onChange={(value) => setMaxPrice(Number(value))}
                      min={minPrice}
                      max={10000}
                      step={50}
                      decimalScale={2}
                      suffix=" ₺"
                      className="flex-1"
                    />
                  </Group>

                  <div className="pt-2">
                    <RangeSlider
                      value={[minPrice, maxPrice]}
                      onChange={([min, max]) => {
                        setMinPrice(min);
                        setMaxPrice(max);
                      }}
                      min={0}
                      max={10000}
                      step={50}
                      minRange={50}
                      label={(value) => `${value.toLocaleString("tr-TR")} ₺`}
                      marks={[
                        { value: 0, label: "0 ₺" },
                        { value: 2000, label: "2.000 ₺" },
                        { value: 4000, label: "4.000 ₺" },
                        { value: 6000, label: "6.000 ₺" },
                        { value: 8000, label: "8.000 ₺" },
                        { value: 10000, label: "10.000 ₺" },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>

            <Divider />

            {/* Sıralama */}
            <div>
              <UnstyledButton
                onClick={() => setSortCollapsed((prev) => !prev)}
                className="group flex w-full items-center justify-between py-2"
              >
                <span className="font-semibold uppercase group-hover:text-gray-900">
                  Sıralama
                </span>
                <IoMdAdd
                  className={`h-4 w-4 transition-transform duration-300 ${
                    sortCollapsed ? "rotate-45" : "rotate-0"
                  }`}
                />
              </UnstyledButton>

              {sortCollapsed && (
                <div className="mt-4 space-y-2">
                  {sortOptions.map((option) => (
                    <UnstyledButton
                      key={option.value}
                      onClick={() => setSelectedSort(option.value)}
                      className={`group relative flex w-full items-center px-4 py-3 transition-all duration-200 ${
                        selectedSort === option.value
                          ? "bg-primary-50/50 font-medium text-primary-900"
                          : "text-secondary-600 hover:bg-primary-50/30"
                      }`}
                    >
                      {/* Sol kenar çizgisi */}
                      <span
                        className={`absolute left-0 top-0 h-full w-[3px] bg-primary-600 transition-all duration-200 ${
                          selectedSort === option.value
                            ? "scale-y-100"
                            : "scale-y-0"
                        }`}
                      ></span>

                      <span className="relative ml-2">{option.label}</span>

                      {/* Sağ taraftaki check işareti */}
                      {selectedSort === option.value && (
                        <FaCheck className="absolute right-2 text-primary-600" />
                      )}
                    </UnstyledButton>
                  ))}
                </div>
              )}
            </div>

            <Divider className="mt-auto" />
            <Group justify="space-between">
              <Button
                variant="light"
                onClick={handleReset}
                className="text-secondary-600 hover:text-secondary-800"
              >
                Sıfırla
              </Button>
              <Button
                onClick={handleApply}
                className="bg-primary-600 text-white hover:bg-primary-700"
              >
                Uygula
              </Button>
            </Group>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
};

export default FilterDrawer;
