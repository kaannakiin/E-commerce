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
          },
          price: variant.price,
          discount: variant.discount || 0,
          type: variant.type,
          value: variant.value,
          Image: variant.Image,
        }))
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
  const spotlightItems = currentProducts.map((item) => ({
    id: item.slug,
    label: item.product.name,
    description: item.product.shortDescription,
    onClick: () => (window.location.href = `/products/${item.slug}`),
    render: () => (
      <Group justify="space-between" p="md" className="hover:bg-gray-50 w-full">
        <Group gap="md">
          <div className="w-20 h-20 relative">
            <CustomImage
              src={item.Image[0].url.replace(/\.[^/.]+$/, "")}
              quality={50}
            />
          </div>
          <Stack gap="xs">
            <Text fw={500} size="sm" className="text-gray-900">
              {item.product.name}
            </Text>
            <Text size="xs" c="dimmed" className="line-clamp-1">
              {item.product.shortDescription}
            </Text>
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
        <Stack gap="xs" align="flex-end">
          {item.discount > 0 ? (
            <>
              <Badge color="red" variant="light">
                %{item.discount} İndirim
              </Badge>
              <Group gap="xs">
                <Text size="sm" td="line-through" c="dimmed">
                  {formatPrice(item.price)}
                </Text>
                <Text size="sm" fw={700} c="red">
                  {formatPrice(
                    (item.price - (item.price * item.discount) / 100).toFixed(2)
                  )}{" "}
                  TL
                </Text>
              </Group>
            </>
          ) : (
            <Text size="sm" fw={700}>
              {formatPrice(item.price)}
            </Text>
          )}
        </Stack>
      </Group>
    ),
  }));
  return (
    <>
      <IoSearchOutline
        size={28}
        className="cursor-pointer"
        onClick={() => spotlight.open()}
      />
      <Spotlight.Root>
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
