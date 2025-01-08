"use client";
import { SearchProductForSpotlight } from "@/actions/user/search-product-for-spotlight";
import { calculatePrice } from "@/lib/calculatePrice";
import { Center, Group, Paper, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { Spotlight, spotlight } from "@mantine/spotlight";
import "@mantine/spotlight/styles.css";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { TbMoodEmpty } from "react-icons/tb";
import CustomImage from "./CustomImage";
import MainLoader from "./MainLoader";

interface SearchDefaultActionType {
  slug: string;
  price: number;
  discount: number;
  product: {
    name: string;
    taxRate: number;
  };
  Image: Array<{ url: string }>;
  type: "COLOR" | "WEIGHT" | "SIZE";
  value: string;
  unit?: string;
}

interface SpotlightActionDataType {
  name: string;
  value: string;
  unit: string;
  finalPrice: number;
  discountedPrice: number;
  type: "COLOR" | "WEIGHT" | "SIZE";
  image: string;
  url: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
};

const SearchSpotlight = ({
  featuredProducts,
}: {
  featuredProducts: SearchDefaultActionType[];
}) => {
  const { push } = useRouter();
  const [searchData, setSearchData] = useState<
    SpotlightActionDataType[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = useDebouncedCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim().length < 2) {
      setSearchData(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await SearchProductForSpotlight(searchQuery);

      if (!response.success) {
        setSearchData(null);
        return;
      }

      const formattedData = response.data.map((product) => {
        const prices = calculatePrice(
          product.Variant[0].price,
          product.Variant[0].discount,
          product.taxRate,
        );

        return {
          name: product.name,
          value: product.Variant[0].value,
          unit: product.Variant[0].unit,
          type: product.Variant[0].type,
          finalPrice: prices.finalPrice,
          discountedPrice: prices.originalPrice - prices.finalPrice,
          image: product.Variant[0].Image[0].url,
          url: `/${product.Variant[0].slug}`,
        };
      });

      setSearchData(formattedData);
    } catch (error) {
      console.error("Arama sırasında hata oluştu:", error);
      setSearchData(null);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const renderProductItem = (
    name: string,
    image: string,
    value: string,
    type: string,
    unit?: string,
    finalPrice?: number,
    discountedPrice?: number,
  ) => (
    <Group
      wrap="nowrap"
      w="100%"
      className="hover:bg-secondary-1/10 rounded-lg p-2 transition-colors"
    >
      <Center className="bg-secondary-1 relative h-20 w-20 overflow-hidden rounded-lg">
        <CustomImage
          src={image}
          quality={40}
          alt={name}
          className="object-cover"
        />
      </Center>
      <div className="flex-1 space-y-1">
        <Text className="line-clamp-2 font-medium" size="sm">
          {name}
        </Text>
        <div className="flex items-center gap-2">
          {type === "COLOR" ? (
            <span
              className="border-secondary-3 inline-block h-6 w-6 rounded-full border"
              style={{ backgroundColor: value }}
            />
          ) : (
            <Paper
              component="span"
              bg="secondary.1"
              c="secondary.8"
              className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-sm font-medium"
            >
              {type === "WEIGHT" ? `${value} ${unit}` : value}
            </Paper>
          )}
          {finalPrice && (
            <div className="ml-auto space-y-0.5 text-right">
              <Text className="text-primary-9 font-bold" size="sm">
                {formatPrice(finalPrice)}
              </Text>
              {discountedPrice > 0 && (
                <Text className="text-secondary-5 text-xs line-through">
                  {formatPrice(finalPrice + discountedPrice)}
                </Text>
              )}
            </div>
          )}
        </div>
      </div>
    </Group>
  );

  const renderDefaultActions = () =>
    featuredProducts.map((product) => {
      const prices = calculatePrice(
        product.price,
        product.discount,
        product.product.taxRate,
      );

      return (
        <Spotlight.Action
          key={product.slug}
          onClick={() => push(`/${product.slug}`)}
        >
          {renderProductItem(
            product.product.name,
            product.Image[0].url,
            product.value,
            product.type,
            product.unit,
            prices.finalPrice,
            prices.originalPrice - prices.finalPrice,
          )}
        </Spotlight.Action>
      );
    });

  const renderEmptyState = () => (
    <div className="text-secondary-5 flex flex-col items-center justify-center py-8">
      <TbMoodEmpty size={48} className="mb-2" />
      <Text size="sm">Aradığınız ürün bulunamadı.</Text>
    </div>
  );

  return (
    <Fragment>
      <IoSearchOutline
        size={28}
        className="text-secondary-7 hover:text-secondary-9 cursor-pointer transition-colors"
        onClick={spotlight.open}
      />
      <Spotlight.Root>
        <Spotlight.Search
          onChange={(event) => handleSearch(event.currentTarget.value)}
          placeholder="Dilediğiniz ürünü arayabilirsiniz."
          classNames={{
            wrapper: "border-b border-secondary-3",
            input:
              "focus:ring-0 focus:outline-none focus:border-none text-lg py-4",
          }}
        />
        {isLoading ? (
          <MainLoader />
        ) : searchData ? (
          searchData.length > 0 ? (
            searchData.map((item) => (
              <Spotlight.Action key={item.url} onClick={() => push(item.url)}>
                {renderProductItem(
                  item.name,
                  item.image,
                  item.value,
                  item.type,
                  item.unit,
                  item.finalPrice,
                  item.discountedPrice,
                )}
              </Spotlight.Action>
            ))
          ) : (
            query.length >= 2 && renderEmptyState()
          )
        ) : (
          renderDefaultActions()
        )}
      </Spotlight.Root>
    </Fragment>
  );
};

export default SearchSpotlight;
