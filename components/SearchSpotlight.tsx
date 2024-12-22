"use client";
import { SearchProductForSpotlight } from "@/actions/user/search-product-for-spotlight";
import { calculatePrice } from "@/lib/calculatePrice";
import { formattedPrice } from "@/lib/format";
import {
  Badge,
  ColorSwatch,
  Group,
  Stack,
  Text
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { Spotlight, spotlight } from "@mantine/spotlight";
import "@mantine/spotlight/styles.css";
import React, { Fragment } from "react";
import { IoSearchOutline } from "react-icons/io5";
import CustomImage from "./CustomImage";
import MainLoader from "./MainLoader";

const SearchSpotlight = ({ featuredProducts }) => {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState("");

  const searchProducts = async (searchQuery) => {
    try {
      const response = await SearchProductForSpotlight(searchQuery);

      if (!response.success) {
        setErrorMessage(response.message);
        return [];
      }

      const transformedData = response.data.flatMap((product) =>
        product.Variant.map((variant) => ({
          slug: variant.slug,
          product: {
            name: product.name,
            shortDescription: product.shortDescription,
            taxRate: product.taxRate,
          },
          price: variant.price,
          discount: variant.discount || 0,
          type: variant.type,
          value: variant.value,
          unit: variant.unit,
          Image: variant.Image,
        })),
      );

      return transformedData;
    } catch (error) {
      console.error("Search error:", error);
      setErrorMessage("Arama sırasında bir hata oluştu");
      return [];
    }
  };

  const handleSearch = useDebouncedCallback(async (newQuery) => {
    setQuery(newQuery);
    setErrorMessage("");

    if (newQuery.trim().length === 0) {
      setSearchResults(null);
      return;
    }

    if (newQuery.trim().length < 2) {
      setErrorMessage("Lütfen en az 2 karakter girin");
      return;
    }

    setLoading(true);
    try {
      const results = await searchProducts(newQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error during search:", error);
      setErrorMessage("Beklenmedik bir hata oluştu");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, 1000);

  const currentProducts =
    searchResults === null ? featuredProducts : searchResults;
  const spotlightItems = currentProducts.map((item) => {
    const priceCalculation = calculatePrice(
      item.price,
      item.discount,
      item.product.taxRate,
    );
    return {
      id: item.slug,
      label: item.product.name,
      description: item.product.shortDescription,
      onClick: () => (window.location.href = `/${item.slug}`),
      render: () => (
        <Group
          justify="space-between"
          p="md"
          className="w-full hover:bg-gray-50"
        >
          <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <div className="relative h-20 w-20 flex-shrink-0">
              {item.Image[0] && (
                <CustomImage
                  src={item.Image[0].url}
                  objectFit="cover"
                  quality={20}
                  sizes="(max-width: 640px) 100vw, 640px"
                />
              )}
            </div>
            <Stack gap="xs" style={{ minWidth: 0, flex: 1, maxWidth: "60%" }}>
              <Text fw={500} size="sm" className="truncate text-gray-900">
                {item.product.name}
              </Text>
              <div className="max-w-full">
                <Text
                  size="xs"
                  c="dimmed"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.product.shortDescription}
                </Text>
              </div>
              {item.type === "COLOR" && (
                <Group gap="xs">
                  <ColorSwatch color={item.value} size={20} />
                </Group>
              )}
              {item.type !== "COLOR" && (
                <span className="text-secondary-950 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium">
                  {item.type === "WEIGHT" && `${item.value}${item.unit}`}
                  {item.type === "SIZE" && `${item.value}`}
                </span>
              )}
            </Stack>
          </Group>
          <Stack gap="xs" align="flex-end" className="ml-4 flex-shrink-0">
            <Text size="sm" fw={700}>
              {formattedPrice(priceCalculation.finalPrice)}
            </Text>
            {item.discount > 0 && (
              <Fragment>
                <Text size="sm" td="line-through" c="dimmed">
                  {formattedPrice(priceCalculation.originalPrice)}
                </Text>
                <Badge color="red" variant="light">
                  %{priceCalculation.discount} İndirim
                </Badge>
              </Fragment>
            )}
          </Stack>
        </Group>
      ),
    };
  });

  return (
    <Fragment>
      <IoSearchOutline
        size={28}
        className="cursor-pointer"
        onClick={() => spotlight.open()}
      />
      <Spotlight.Root
        styles={{
          action: {
            "&[data-selected]": {
              backgroundColor: "transparent", // Seçili durumda bg'yi kaldırır
            },
            "&:hover": {
              backgroundColor: "transparent", // Hover durumunda bg'yi kaldırır
            },
          },
        }}
      >
        <Spotlight.Search
          onChange={(event) => handleSearch(event.currentTarget.value)}
          placeholder="Ürün ara"
          rightSection={<IoSearchOutline size={30} />}
        />
        <Spotlight.ActionsList>
          {loading ? (
            <div
              style={{ position: "relative", height: "200px", width: "100%" }}
            >
              <MainLoader />
            </div>
          ) : errorMessage ? (
            <Text c="dimmed" ta="center" py="xl">
              {errorMessage}
            </Text>
          ) : currentProducts.length > 0 ? (
            spotlightItems.map((action) => (
              <Spotlight.Action key={action.id} onClick={action.onClick}>
                {action.render()}
              </Spotlight.Action>
            ))
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              Sonuç bulunamadı
            </Text>
          )}
        </Spotlight.ActionsList>
      </Spotlight.Root>
    </Fragment>
  );
};

export default SearchSpotlight;
