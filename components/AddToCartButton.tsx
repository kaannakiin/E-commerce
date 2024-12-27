"use client";
import FeedbackDialog from "@/components/FeedbackDialog";
import { useStore } from "@/store/store";
import { Paper, Stack, Text, UnstyledButton } from "@mantine/core";
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
    if (!variant) return;

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
     <Stack gap="xs">
       <UnstyledButton
         classNames={{ root: "group" }} // Burayı ekledik
         styles={{
           root: {
             width: "100%",
             ...(variant.isPublished === false && {
               cursor: "not-allowed",
               opacity: 0.5,
             }),
           },
         }}
         disabled={variant.isPublished === false}
         onClick={handleAddToCart}
       >
         <Paper
           component="span"
           styles={{
             root: {
               position: "relative",
               display: "flex",
               height: "2rem",
               width: "100%",
               alignItems: "center",
               justifyContent: "center",
               overflow: "hidden",
               borderRadius: "var(--mantine-radius-md)",
               border: "1px solid var(--mantine-color-secondary-5)",
               color: "var(--mantine-color-secondary-5)",
               transition: "box-shadow 300ms",
               backgroundColor: "transparent", // Bunu ekledik
               "&:hover": {
                 boxShadow: "var(--mantine-shadow-sm)",
               },
             },
           }}
         >
           <Text
             component="span"
             styles={{
               root: {
                 position: "relative",
                 zIndex: 10,
                 fontSize: "0.875rem",
                 fontWeight: 500,
                 letterSpacing: "0.025em",
                 transition: "color 300ms",
                 ".group:hover &": {
                   // Selector'ı değiştirdik
                   color: "white",
                 },
               },
             }}
           >
             {variant.isPublished === false ? "Tükendi" : "Tekrar Satın Al"}
           </Text>
           <Paper
             styles={{
               root: {
                 position: "absolute",
                 inset: 0,
                 transform: "translateY(100%)",
                 transition: "transform 300ms ease-out",
                 backgroundColor:
                   variant.isPublished === false
                     ? "var(--mantine-color-red-5)"
                     : "var(--mantine-color-secondary-5)",
                 ".group:hover &": {
                   // Selector'ı değiştirdik
                   transform: "translateY(0)",
                 },
               },
             }}
           />
         </Paper>
       </UnstyledButton>
       <FeedbackDialog
         isOpen={dialogState.isOpen}
         onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
         message={dialogState.message}
         type={dialogState.type}
       />
     </Stack>
   );
 }
  return (
    <Paper
      styles={{
        root: {
          borderTop: "1px solid var(--mantine-color-gray-3)",
          paddingTop: "var(--mantine-spacing-md)",
          backgroundColor: "transparent",
        },
      }}
    >
      <UnstyledButton
        classNames={{ root: "group" }} // group class'ını ekledik
        styles={{
          root: {
            width: "100%",
          },
        }}
        onClick={handleAddToCart}
      >
        <Paper
          component="span"
          styles={{
            root: {
              position: "relative",
              display: "flex",
              height: "3.5rem",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: "var(--mantine-radius-lg)",
              border: "2px solid var(--mantine-color-primary-5)",
              color: "var(--mantine-color-primary-5)",
              transition: "box-shadow 300ms",
              backgroundColor: "transparent",
              "&:hover": {
                boxShadow: "var(--mantine-shadow-lg)",
              },
            },
          }}
        >
          <Text
            component="span"
            styles={{
              root: {
                position: "relative",
                zIndex: 10,
                fontSize: "1.125rem",
                fontWeight: 500,
                letterSpacing: "0.025em",
                transition: "color 300ms",
                ".group:hover &": {
                  // selector'ı değiştirdik
                  color: "white",
                },
              },
            }}
          >
            {isSiparisPage ? "Tekrar Sipariş Ver" : "Sepete Ekle"}
          </Text>
          <Paper
            styles={{
              root: {
                position: "absolute",
                inset: 0,
                transform: "translateY(100%)",
                transition: "transform 300ms ease-out",
                backgroundColor: "var(--mantine-color-primary-5)",
                ".group:hover &": {
                  // selector'ı değiştirdik
                  transform: "translateY(0)",
                },
              },
            }}
          />
        </Paper>
      </UnstyledButton>
    </Paper>
  );
};

export default AddToCartButton;
