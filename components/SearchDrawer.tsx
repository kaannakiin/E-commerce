"use client";
import { rem } from "@mantine/core";
import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { Spotlight, spotlight, SpotlightActionData } from "@mantine/spotlight";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

const SearchDrawer = () => {
  const products: Product[] = [
    {
      id: "1",
      name: "Yoga Matı",
      description: "Premium kalite yoga matı",
      price: 299.99,
      category: "Yoga Ekipmanları",
    },
    {
      id: "2",
      name: "Pilates Topu",
      description: "65cm fitness topu",
      price: 199.99,
      category: "Pilates Ekipmanları",
    },
    // Diğer ürünler...
  ];
  const productActions: SpotlightActionData[] = products.map((product) => ({
    id: product.id,
    label: product.name,
    description: `${product.description} - ${product.price.toFixed(2)} TL`,
    group: product.category,
    onClick: () => handleProductClick(product),
    leftSection: (
      <IoSearchOutline style={{ width: rem(24), height: rem(24) }} />
    ),
  }));

  // Ürüne tıklandığında çalışacak fonksiyon
  const handleProductClick = (product: Product) => {
    // Ürün detay sayfasına yönlendirme veya modal açma
    console.log("Seçilen ürün:", product);
    // Örnek: router.push(`/products/${product.id}`);
  };

  return (
    <>
      <IoSearchOutline
        size={28}
        className="cursor-pointer"
        onClick={() => spotlight.open()}
      />
      <Spotlight
        actions={productActions}
        nothingFound="Ürün bulunamadı..."
        highlightQuery
        limit={7}
        searchProps={{
          leftSection: (
            <IoSearchOutline style={{ width: rem(20), height: rem(20) }} />
          ),
          placeholder: "Ürün ara...",
        }}
        filter={(query, actions) => {
          // Gelişmiş arama filtresi
          const searchWords = query.toLowerCase().trim().split(" ");

          return actions.filter((action) => {
            const searchText = `${(action as SpotlightActionData).label} ${
              (action as SpotlightActionData).description
            }`.toLowerCase();
            return searchWords.every((word) => searchText.includes(word));
          });
        }}
      />
    </>
  );
};

export default SearchDrawer;
