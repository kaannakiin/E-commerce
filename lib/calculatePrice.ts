const truncateToTwo = (number: number): number =>
  Math.floor(number * 100) / 100;

interface PriceCalculationResult {
  finalPrice: number;
  originalPrice: number;
  discount: number;
  discountAmount: number;
  taxAmount: number;
}

export const calculatePrice = (
  price: number,
  discount: number = 0,
  taxRate: number = 18,
): PriceCalculationResult => {
  const basePrice = truncateToTwo(price);
  const taxAmount = truncateToTwo((basePrice * taxRate) / 100);
  const originalPrice = truncateToTwo(basePrice + taxAmount);

  const discountAmount = truncateToTwo((originalPrice * discount) / 100);
  const finalPrice = truncateToTwo(originalPrice - discountAmount);

  return {
    finalPrice,
    originalPrice,
    discount,
    discountAmount,
    taxAmount,
  };
};
