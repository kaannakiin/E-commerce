import { createHash } from "crypto";
import CryptoJS from "crypto-js";
import { parseISO, isToday, differenceInDays, fromUnixTime } from "date-fns";

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
const IYZICO_ALLOWED_IPS = {
  notification: {
    current: ["85.111.48.36", "85.111.9.165"], // Mevcut Production ve Disaster IP'leri
    new: ["213.226.118.16", "193.142.35.16", "213.226.118.95"], // Yeni Production ve Disaster IP'leri
  },
};

export const isIyzicoIP = (clientIP: string | null): boolean => {
  if (!clientIP) return false;

  const ip = clientIP.split(",")[0].trim();

  return [
    ...IYZICO_ALLOWED_IPS.notification.current,
    ...IYZICO_ALLOWED_IPS.notification.new,
  ].includes(ip);
};
import { NextResponse } from "next/server";

export function handlingError(errorCode: string) {
  switch (errorCode) {
    case "11":
      return NextResponse.json(
        {
          status: 400,
          message: "Kart numarası hatalı, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    case "12":
      return NextResponse.json(
        {
          status: 400,
          message: "Kart numarası hatalı, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    case "13":
      return NextResponse.json(
        {
          status: 400,
          message: "Son kullanma ayı hatalı, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    case "14":
      return NextResponse.json(
        {
          status: 400,
          message: "Son kullanma yılı hatalı, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    case "15":
      return NextResponse.json(
        {
          status: 400,
          message: "Cvc geçersiz, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    case "17":
      return NextResponse.json(
        {
          status: 400,
          message:
            "Kartınız son kullanma tarihi geçersizdir, lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
    default:
      return NextResponse.json(
        {
          status: 400,
          message: "Kart bilgilerinizi lütfen kontrol ediniz.",
        },
        { status: 400 },
      );
  }
}

type DateInput = Date | string;

export const isSameDay = (date: DateInput): boolean => {
  try {
    // Gelen değer string ise parse et, Date instance ise direkt kullan
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    const localDate = new Date(parsedDate.getTime() + 3 * 60 * 60 * 1000); // UTC+3
    return isToday(localDate);
  } catch (error) {
    console.error("Tarih kontrolünde hata:", error);
    return false;
  }
};

export const isWithinDays = (date: DateInput, days: number = 14): boolean => {
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    const localDate = new Date(parsedDate.getTime() + 3 * 60 * 60 * 1000); // UTC+3
    const today = new Date();
    const dayDifference = differenceInDays(today, localDate);

    return dayDifference >= 0 && dayDifference <= days;
  } catch (error) {
    console.error("Tarih kontrolünde hata:", error);
    return false;
  }
};
export const convertUnixToISOString = (unixTimestamp: number): string => {
  const date = fromUnixTime(unixTimestamp / 1000);
  return date.toISOString();
};
