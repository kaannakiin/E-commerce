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
