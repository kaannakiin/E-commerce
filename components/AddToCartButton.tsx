"use client";
import { useStore } from "@/store/store";
import { Button } from "@mantine/core";
import { usePathname } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { FaCheck } from "react-icons/fa";

interface AddToCartButtonProps {
  variant;
  repeatBuy?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  variant,
  repeatBuy = false,
}) => {
  const addItem = useStore((state) => state.addItem);
  const pathname = usePathname();
  const isSiparisPage = pathname.includes("/siparis");

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

  if (repeatBuy) {
    return (
      <Button
        variant="filled"
        size="compact-xl"
        color="gray.9"
        radius={0}
        onClick={handleAddToCart}
        autoContrast
        fullWidth
        disabled={variant.isPublished === false}
      >
        {variant.isPublished === false ? "Tükendi" : "Tekrar Satın Al"}
      </Button>
    );
  }
  return (
    <Button
      variant="filled"
      size="lg" // size'ı lg yapıyoruz
      className="h-10" // Sabit yükseklik veriyoruz
      color="gray.9"
      radius={0}
      onClick={handleAddToCart}
      autoContrast
      fullWidth
    >
      {isSiparisPage ? "Tekrar Sipariş Ver" : "Sepete Ekle"}
    </Button>
  );
};

export default AddToCartButton;
