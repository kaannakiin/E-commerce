import crypto from "crypto";

export function formatPrice(price: number): string {
  const str = price.toString();
  if (!str.includes(".")) return str;

  const [integer, decimal] = str.split(".");
  if (!decimal) return integer;

  const cleanDecimal = decimal.replace(/0+$/, "");
  if (!cleanDecimal) return integer;

  return `${integer}.${cleanDecimal}`;
}

export function generateIyzicoSignature(
  endpoint: "initialize" | "auth",
  data: {
    paymentId: string;
    conversationId: string;
    currency?: string;
    basketId?: string;
    paidPrice?: number;
    price?: number;
  },
): string {
  const secretKey = process.env.SECRET_KEY_IYZICO!;

  let dataToSign: string[];

  if (endpoint === "initialize") {
    dataToSign = [data.paymentId, data.conversationId];
  } else {
    dataToSign = [
      data.paymentId,
      data.currency!,
      data.basketId!,
      data.conversationId,
      formatPrice(data.paidPrice!),
      formatPrice(data.price!),
    ];
  }

  const signatureString = dataToSign.join(":");

  return crypto
    .createHmac("sha256", secretKey)
    .update(signatureString)
    .digest("hex");
}

export function verifyIyzicoSignature(
  endpoint: "initialize" | "auth",
  data: {
    paymentId: string;
    conversationId: string;
    currency?: string;
    basketId?: string;
    paidPrice?: number;
    price?: number;
    signature: string;
  },
): boolean {
  const calculatedSignature = generateIyzicoSignature(endpoint, data);
  return calculatedSignature === data.signature;
}
