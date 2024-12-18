"use client";
import React from "react";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { IoSearchOutline } from "react-icons/io5";
import CustomImage from "./CustomImage";
import {
  Group,
  Stack,
  Text,
  Badge,
  ColorSwatch,
  LoadingOverlay,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import "@mantine/spotlight/styles.css";
import { SearchProductForSpotlight } from "@/actions/user/search-product-for-spotlight";
import { formatPrice } from "@/lib/formatter";
import { calculatePrice } from "@/lib/calculatePrice";

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
          slug: product.categories[0].slug + "/" + variant.slug,
          product: {
            name: product.name,
            shortDescription: product.shortDescription,
            taxRate: product.taxRate,
          },
          price: variant.price,
          discount: variant.discount || 0,
          type: variant.type,
          value: variant.value,
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
              <CustomImage
                src={item.Image[0].url.replace(/\.[^/.]+$/, "")}
                objectFit="contain"
                quality={20}
              />
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
                  <Text size="xs" c="dimmed">
                    Renk:
                  </Text>
                  <ColorSwatch color={item.value} size={20} />
                </Group>
              )}
            </Stack>
          </Group>
          <Stack gap="xs" align="flex-end" className="ml-4 flex-shrink-0">
            <Text size="sm" fw={700}>
              {formatPrice(priceCalculation.finalPrice)}
            </Text>
            {item.discount > 0 && (
              <>
                <Text size="sm" td="line-through" c="dimmed">
                  {formatPrice(priceCalculation.originalPrice)}
                </Text>
                <Badge color="red" variant="light">
                  %{priceCalculation.discount} İndirim
                </Badge>
              </>
            )}
          </Stack>
        </Group>
      ),
    };
  });

  return (
    <>
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
              <LoadingOverlay
                visible={true}
                zIndex={1000}
                overlayProps={{ radius: "sm", blur: 2 }}
                loaderProps={{ color: "primary", type: "oval" }}
              />
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
    </>
  );
};

export default SearchSpotlight;
