import { DiscountCheck } from "@/actions/user/discount-check";
import { BasketItem } from "@/types/types";
import { DiscountType } from "@prisma/client";
import { prisma } from "./prisma";
import { calculatePrice } from "./calculatePrice";

const truncateToTwo = (number: number) => ~~(number * 100) / 100;

export async function Calculate(
  data: { variantId: string; quantity: number }[],
  discountCode: string,
): Promise<{
  items: BasketItem[];
  itemsWithQuantity: Array<BasketItem & { quantity: number }>;
  totalPrice: number;
  discountAmount: number;
  originalTotalPrice: number;
}> {
  const quantityMap = new Map(
    data.map((item) => [item.variantId, Math.floor(item.quantity)]),
  );

  const variants = await prisma.variant.findMany({
    where: {
      id: {
        in: data.map((item) => item.variantId),
      },
    },
    select: {
      id: true,
      price: true,
      discount: true,
      product: {
        select: {
          name: true,
          taxRate: true,
          categories: {
            select: {
              name: true,
            },
            take: 1,
          },
        },
      },
    },
  });

  // Calculate items with quantity first
  const itemsWithQuantity = variants.map((variant) => {
    const quantity = quantityMap.get(variant.id) || 0;
    const calculate = calculatePrice(
      variant.price,
      variant.discount,
      variant.product.taxRate,
    );

    const unitPrice = truncateToTwo(calculate.finalPrice);
    const totalPrice = truncateToTwo(unitPrice * quantity);

    return {
      id: variant.id,
      price: truncateToTwo(variant.price),
      taxRate: variant.product.taxRate,
      discount: variant.discount,
      unitPrice,
      totalPrice,
      name: variant.product.name,
      itemType: "PHYSICAL" as const,
      category1: variant.product.categories[0].name,
      quantity,
    };
  });

  // Calculate original total price
  const originalTotalPrice = truncateToTwo(
    itemsWithQuantity.reduce((sum, item) => sum + item.totalPrice, 0),
  );

  // Create individual items array
  const items: BasketItem[] = [];
  itemsWithQuantity.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      items.push({
        id: item.id,
        price: truncateToTwo(item.unitPrice),
        name: item.name,
        itemType: item.itemType,
        category1: item.category1,
      });
    }
  });

  let totalPrice = originalTotalPrice;
  let discountAmount = 0;

  // Apply discount if exists
  if (discountCode) {
    const discount = await DiscountCheck(
      discountCode,
      data.map((item) => item.variantId),
    );

    if (discount.success) {
      if (discount.discountType === DiscountType.FIXED) {
        discountAmount = truncateToTwo(discount.discountAmount || 0);
      } else {
        discountAmount = truncateToTwo(
          (originalTotalPrice * (discount.discountAmount || 0)) / 100,
        );
      }

      totalPrice = truncateToTwo(originalTotalPrice - discountAmount);

      // Calculate discount per item
      const itemCount = items.length;
      let remainingDiscount = discountAmount;

      // Distribute discount among items
      items.forEach((item, index) => {
        if (index === itemCount - 1) {
          // Last item gets remaining discount
          item.price = truncateToTwo(
            item.price - truncateToTwo(remainingDiscount),
          );
        } else {
          const itemDiscount = truncateToTwo(
            (item.price / originalTotalPrice) * discountAmount,
          );
          item.price = truncateToTwo(item.price - itemDiscount);
          remainingDiscount = truncateToTwo(remainingDiscount - itemDiscount);
        }
      });

      // Update itemsWithQuantity with new prices
      const priceMap = new Map<string, number[]>();
      items.forEach((item) => {
        if (!priceMap.has(item.id)) {
          priceMap.set(item.id, []);
        }
        priceMap.get(item.id)?.push(item.price);
      });

      itemsWithQuantity.forEach((item) => {
        const prices = priceMap.get(item.id) || [];
        const totalPrice = truncateToTwo(
          prices.reduce((sum, price) => sum + price, 0),
        );
        item.unitPrice = truncateToTwo(totalPrice / item.quantity);
        item.totalPrice = totalPrice;
      });
    }
  }

  // Final verification
  const finalItemsTotal = truncateToTwo(
    items.reduce((sum, item) => sum + item.price, 0),
  );

  if (finalItemsTotal !== totalPrice) {
    const diff = truncateToTwo(totalPrice - finalItemsTotal);
    items[items.length - 1].price = truncateToTwo(
      items[items.length - 1].price + diff,
    );

    // Update corresponding itemWithQuantity
    const lastItem = items[items.length - 1];
    const lastItemWithQuantity = itemsWithQuantity.find(
      (item) => item.id === lastItem.id,
    );
    if (lastItemWithQuantity) {
      const newTotalPrice = truncateToTwo(
        lastItemWithQuantity.totalPrice + diff,
      );
      lastItemWithQuantity.totalPrice = newTotalPrice;
      lastItemWithQuantity.unitPrice = truncateToTwo(
        newTotalPrice / lastItemWithQuantity.quantity,
      );
    }
  }

  return {
    items,
    itemsWithQuantity,
    totalPrice,
    discountAmount,
    originalTotalPrice,
  };
}
