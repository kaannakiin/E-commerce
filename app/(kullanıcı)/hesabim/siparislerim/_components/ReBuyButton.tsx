"use client";

import { Button } from "@mantine/core";
import { VariantType } from "@prisma/client";
import { useStore } from "@/store/store";

interface Variant {
  id: string;
  price: number;
  type: VariantType;
  value: string;
  unit: string;
  discount: number;
  stock: number;
  isPublished?: boolean;
  product: {
    id: string;
    name: string;
    description: string;
    taxRate: number;
  };
  Image: {
    url: string;
    alt: string;
  }[];
}

interface ReBuyButtonProps {
  variant: Variant;
}

const ReBuyButton = ({ variant }: ReBuyButtonProps) => {
  const addItem = useStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!variant) return;

    try {
      addItem(variant);
    } catch (error) {
      console.error("Ürün eklenirken hata oluştu:", error);
    }
  };

  return (
    <Button
      size="xs"
      variant="outline"
      onClick={handleAddToCart}
      disabled={variant.isPublished === false}
      color={variant.isPublished === false ? "red" : "blue"}
    >
      {variant.isPublished === false ? "Tükendi" : "Tekrar Satın Al"}
    </Button>
  );
};

export default ReBuyButton;
