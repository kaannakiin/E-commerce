"use client";

import { Button } from "@mantine/core";
import { VariantType } from "@prisma/client";
import { useStore } from "@/store/store";
import { FaCheck } from "react-icons/fa";
import { notifications } from "@mantine/notifications";

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
      notifications.show({
        position: "top-center",
        withCloseButton: false,
        icon: <FaCheck size={20} />,
        message: `Ürün sepete eklendi.`,
        autoClose: 1500,
      });
    } catch (error) {
      console.error("Ürün eklenirken hata oluştu:", error);
    }
  };

  return (
    <Button
      size="xs"
      variant="filled"
      radius={0}
      onClick={handleAddToCart}
      className="w-full lg:w-fit"
      disabled={variant.isPublished === false}
      color={variant.isPublished === false ? "red" : "gray.9"}
    >
      {variant.isPublished === false ? "Tükendi" : "Tekrar Satın Al"}
    </Button>
  );
};

export default ReBuyButton;
