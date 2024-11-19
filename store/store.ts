import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CartSlice, createCartSlice } from "./useCartStore";

export const useStore = create<CartSlice>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createCartSlice(...a),
      })),
      {
        name: "cart-storage",
        version: 1,
        partialize: (state) => ({
          items: state.items.map((item) => ({
            ...item,
          })),
          totalItems: state.totalItems,
          totalOriginalPrice: state.totalOriginalPrice,
          totalFinalPrice: state.totalFinalPrice,
          totalDiscountAmount: state.totalDiscountAmount,
          totalTaxAmount: state.totalTaxAmount,
        }),
      },
    ),
  ),
);
