import { StateCreator } from "zustand";
import { VariantType } from "@prisma/client";

interface PriceCalculationResult {
  finalPrice: number;
  originalPrice: number;
  discount: number;
  discountAmount: number;
  taxAmount: number;
}

const truncateToTwo = (number: number): number =>
  Math.floor(number * 100) / 100;

const calculatePrice = (
  price: number,
  discount: number = 0,
  taxRate: number = 18,
): PriceCalculationResult => {
  if (price < 0) throw new Error("Price cannot be negative");
  if (discount < 0 || discount > 100)
    throw new Error("Discount must be between 0 and 100");
  if (taxRate < 0) throw new Error("Tax rate cannot be negative");

  const basePrice = truncateToTwo(price);
  const discountRate = truncateToTwo(discount);
  const truncatedTaxRate = truncateToTwo(taxRate);
  const discountAmount = truncateToTwo((basePrice * discountRate) / 100);
  const priceAfterDiscount = truncateToTwo(basePrice - discountAmount);
  const taxAmount = truncateToTwo(
    (priceAfterDiscount * truncatedTaxRate) / 100,
  );
  const finalPrice = priceAfterDiscount + taxAmount;
  const taxAmountOriginal = truncateToTwo((basePrice * truncatedTaxRate) / 100);
  const originalPrice = basePrice + taxAmountOriginal;

  return {
    finalPrice,
    originalPrice,
    discount: discountRate,
    discountAmount,
    taxAmount: discount > 0 ? taxAmount : taxAmountOriginal,
  };
};

interface Variant {
  id: string;
  product: {
    id: string;
    name: string;
    description: string;
    taxRate: number;
  };
  discount: number;
  price: number;
  stock: number;
  type: VariantType;
  unit: string | null;
  value: string;
  Image: Array<{
    url: string;
    alt: string | null;
  }>;
}

interface CartVariantBase {
  variantId: string;
  productId: string;
  name: string;
  description: string;
  value: string;
  type: VariantType;
  unit: string | null;
  quantity: number;
  imageUrl?: string;
  price: number;
  priceCalculation: PriceCalculationResult;
}

export type CartVariant = CartVariantBase;

type CartState = {
  items: CartVariant[];
  totalItems: number;
  totalOriginalPrice: number;
  totalFinalPrice: number;
};

type CartActions = {
  addItem: (variant: Variant) => boolean;
  removeItem: (variantId: string) => void;
  increaseQuantity: (variantId: string) => void;
  decreaseQuantity: (variantId: string) => void;
  getItemByVariantId: (variantId: string) => CartVariant | undefined;
  updateTotals: () => void;
  clearCart: () => void;
};

export type CartSlice = CartState & CartActions;

const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalOriginalPrice: 0,
  totalFinalPrice: 0,
};

export const createCartSlice: StateCreator<
  CartSlice,
  [["zustand/immer", never]],
  [],
  CartSlice
> = (set, get) => ({
  ...initialCartState,

  addItem: (variant) => {
    let success = false;

    set((state) => {
      const existingItem = state.items.find(
        (item) => item.variantId === variant.id,
      );

      const priceCalculation = calculatePrice(
        variant.price,
        variant.discount,
        variant.product.taxRate,
      );

      if (existingItem) {
        existingItem.quantity += 1;
        success = true;
      } else {
        state.items.push({
          variantId: variant.id,
          productId: variant.product.id,
          name: variant.product.name,
          description: variant.product.description,
          value: variant.value,
          type: variant.type,
          unit: variant.unit,
          price: variant.price,
          priceCalculation,
          quantity: 1,
          imageUrl: variant.Image?.[0]?.url,
        });
        success = true;
      }

      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      state.totalOriginalPrice = truncateToTwo(
        state.items.reduce(
          (sum, item) =>
            sum + item.priceCalculation.originalPrice * item.quantity,
          0,
        ),
      );

      state.totalFinalPrice = truncateToTwo(
        state.items.reduce(
          (sum, item) => sum + item.priceCalculation.finalPrice * item.quantity,
          0,
        ),
      );
    });

    return success;
  },

  increaseQuantity: (variantId) => {
    set((state) => {
      const item = state.items.find((item) => item.variantId === variantId);
      if (item) {
        item.quantity += 1;
        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );

        state.totalOriginalPrice = truncateToTwo(
          state.items.reduce(
            (sum, item) =>
              sum + item.priceCalculation.originalPrice * item.quantity,
            0,
          ),
        );

        state.totalFinalPrice = truncateToTwo(
          state.items.reduce(
            (sum, item) =>
              sum + item.priceCalculation.finalPrice * item.quantity,
            0,
          ),
        );
      }
    });
  },

  decreaseQuantity: (variantId) =>
    set((state) => {
      const itemIndex = state.items.findIndex(
        (item) => item.variantId === variantId,
      );
      if (itemIndex !== -1) {
        if (state.items[itemIndex].quantity === 1) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity -= 1;
        }

        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );

        state.totalOriginalPrice = truncateToTwo(
          state.items.reduce(
            (sum, item) =>
              sum + item.priceCalculation.originalPrice * item.quantity,
            0,
          ),
        );

        state.totalFinalPrice = truncateToTwo(
          state.items.reduce(
            (sum, item) =>
              sum + item.priceCalculation.finalPrice * item.quantity,
            0,
          ),
        );
      }
    }),

  removeItem: (variantId) => {
    set((state) => {
      state.items = state.items.filter((item) => item.variantId !== variantId);
      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      state.totalOriginalPrice = truncateToTwo(
        state.items.reduce(
          (sum, item) =>
            sum + item.priceCalculation.originalPrice * item.quantity,
          0,
        ),
      );

      state.totalFinalPrice = truncateToTwo(
        state.items.reduce(
          (sum, item) => sum + item.priceCalculation.finalPrice * item.quantity,
          0,
        ),
      );
    });
  },

  getItemByVariantId: (variantId) =>
    get().items.find((item) => item.variantId === variantId),

  updateTotals: () => {
    set((state) => {
      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      state.totalOriginalPrice = truncateToTwo(
        state.items.reduce(
          (sum, item) =>
            sum + item.priceCalculation.originalPrice * item.quantity,
          0,
        ),
      );

      state.totalFinalPrice = truncateToTwo(
        state.items.reduce(
          (sum, item) => sum + item.priceCalculation.finalPrice * item.quantity,
          0,
        ),
      );
    });
  },

  clearCart: () => {
    set(initialCartState);
  },
});
