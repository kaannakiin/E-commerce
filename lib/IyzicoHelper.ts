import { createHash } from "crypto";
import CryptoJS from "crypto-js";

export function generateNon3DSignature({
  paymentId,
  currency,
  basketId,
  conversationId,
  paidPrice,
  price,
  conversationData,
  mdStatus,
  status,
  type = "non3D",
}: {
  paymentId: string;
  currency?: string;
  basketId?: string;
  conversationId: string;
  conversationData?: string;
  paidPrice?: string;
  price?: string;
  mdStatus?: string;
  status?: string;
  type?: "Callback" | "non3D";
}) {
  const secretKey = process.env.SECRET_KEY_IYZICO;
  const seperator = ":";

  if (type === "Callback") {
    const params = [
      conversationData,
      conversationId,
      mdStatus,
      paymentId,
      status,
    ].filter((param) => param !== null && param !== undefined);
    const dataToEncrypt = params.join(seperator);
    const encryptedData = CryptoJS.HmacSHA256(dataToEncrypt, secretKey);
    const hashedSignature = CryptoJS.enc.Hex.stringify(encryptedData);
    return hashedSignature;
  } else {
    const params = [
      paymentId,
      currency,
      basketId,
      conversationId,
      paidPrice,
      price,
    ].filter((param) => param !== null && param !== undefined && param !== "");
    const dataToEncrypt = params.join(seperator);
    const encryptedData = CryptoJS.HmacSHA256(dataToEncrypt, secretKey);
    const hashedSignature = CryptoJS.enc.Hex.stringify(encryptedData);
    return hashedSignature;
  }
}
export const calculateQuantitiesWithMap = (transactions) => {
  const quantityMap = new Map();

  transactions.forEach((transaction) => {
    const existing = quantityMap.get(transaction.itemId);

    if (existing) {
      existing.quantity += 1;
      existing.totalPrice += transaction.price;
    } else {
      quantityMap.set(transaction.itemId, {
        quantity: 1,
        totalPrice: transaction.price,
        pricePerUnit: transaction.price,
        itemId: transaction.itemId,
        companyProfit: parseFloat(transaction.merchantPayoutAmount.toFixed(2)),
      });
    }
  });

  return Array.from(quantityMap.values());
};

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString();
  const hash = createHash("sha256")
    .update(timestamp + random)
    .digest("hex")
    .substring(0, 8)
    .toUpperCase();
  const date = new Date();
  const prefix = [
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
  ].join("");
  return `${prefix}${hash}`;
}
interface IGroupedTransaction {
  itemId: string;
  price: number;
  paidPrice: number;
  merchantPayoutAmount: number;
  quantity: number;
}
export const groupTransactionsByItemId = (
  transactions,
): IGroupedTransaction[] => {
  return Object.values(
    transactions.reduce(
      (acc: { [key: string]: IGroupedTransaction }, transaction) => {
        const { itemId, price, paidPrice, merchantPayoutAmount } = transaction;

        if (!acc[itemId]) {
          acc[itemId] = {
            itemId,
            price: Number(price.toFixed(2)),
            paidPrice: Number(paidPrice.toFixed(2)),
            merchantPayoutAmount: Number(merchantPayoutAmount.toFixed(2)),
            quantity: 1,
          };
        } else {
          acc[itemId].quantity += 1;
        }

        return acc;
      },
      {},
    ),
  );
};
