"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useStore } from "@/store/store";
import { UnstyledButton } from "@mantine/core";
import { is } from "date-fns/locale";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const handleAddToCart = () => {
    if (!variant) {
      return;
    }
    try {
      addItem(variant);
      if (repeatBuy) {
        setDialogState({
          isOpen: true,
          message: "Sepete eklendi",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Ürün eklenirken hata oluştu:", error);
    }
  };

  if (repeatBuy) {
    return (
      <div className="space-y-1">
        <UnstyledButton
          className={
            "group w-full" +
            (variant.isPublished === false
              ? " cursor-not-allowed opacity-50"
              : "")
          }
          disabled={variant.isPublished === false}
          onClick={handleAddToCart}
        >
          <span className="relative flex h-8 w-full items-center justify-center overflow-hidden rounded-md border border-primary-500 text-primary-500 transition-shadow duration-300 hover:shadow-sm">
            <span className="relative z-10 text-sm font-medium tracking-wide transition-colors duration-300 group-hover:text-white">
              {variant.isPublished === false ? "Tükendi" : "Tekrar Satın Al"}
            </span>
            <div
              className={`absolute inset-0 translate-y-full transform transition-transform duration-300 ease-out group-hover:translate-y-0 ${variant.isPublished === false ? "bg-red-500" : "bg-primary-500"}`}
            />
          </span>
        </UnstyledButton>
        <FeedbackDialog
          isOpen={dialogState.isOpen}
          onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
          message={dialogState.message}
          type={dialogState.type}
        />
      </div>
    );
  }
  return (
    <div className="space-y-4 border-t pt-4">
      <UnstyledButton className="group w-full" onClick={handleAddToCart}>
        <span className="relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-primary-500 text-primary-500 transition-shadow duration-300 hover:shadow-lg">
          <span className="relative z-10 text-lg font-medium tracking-wide transition-colors duration-300 group-hover:text-white">
            {isSiparisPage ? "Tekrar Sipariş Ver" : "Sepete Ekle"}
          </span>
          <div className="absolute inset-0 translate-y-full transform bg-primary-500 transition-transform duration-300 ease-out group-hover:translate-y-0" />
        </span>
      </UnstyledButton>
    </div>
  );
};

export default AddToCartButton;
