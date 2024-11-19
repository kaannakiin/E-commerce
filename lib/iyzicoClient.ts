interface Initialize3DSBaseResponse {
  locale: string;
  systemTime: number;
  conversationId: string;
  signature: string;
  threeDSHtmlContent: string;
  paymentId: string;
}

// Initialize 3DS başarılı response
interface Initialize3DSSuccessResponse extends Initialize3DSBaseResponse {
  status: "success";
  paymentId: string;
  threeDSHtmlContent: string;

  signature: string;
}

// Initialize 3DS hata response
interface Initialize3DSErrorResponse extends Initialize3DSBaseResponse {
  status: "failure";
  errorCode: string;
  errorMessage: string;
}
export interface SuccessfulPaymentResponse {
  status: "success";
  locale: string;
  systemTime: number;
  price: number;
  paidPrice: number;
  installment: number;
  paymentId: string;
  fraudStatus: 1 | 0 | -1;
  merchantCommissionRate: number;
  merchantCommissionRateAmount: number;
  iyziCommissionRateAmount: number;
  iyziCommissionFee: number;
  cardType: "CREDIT_CARD" | "DEBIT_CARD" | "PREPAID_CARD";
  cardAssociation: "VISA" | "MASTER_CARD" | "AMERICAN_EXPRESS" | "TROY";
  cardFamilyName: string;
  binNumber: string;
  lastFourDigits: string;
  basketId: string;
  currency: string;
  itemTransactions: {
    itemId: string;
    paymentTransactionId: string;
    transactionStatus: 2 | 1 | 0 | -1;
    price: number;
    paidPrice: number;
    merchantCommissionRate: number;
    merchantCommissionRateAmount: number;
    iyziCommissionRateAmount: number;
    iyziCommissionFee: number;
    blockageRate: number;
    blockageRateAmountMerchant: number;
    blockageRateAmountSubMerchant: number;
    blockageResolvedDate: string;
    subMerchantPrice: number;
    subMerchantPayoutRate: number;
    subMerchantPayoutAmount: number;
    merchantPayoutAmount: number;
    convertedPayout: {
      paidPrice: number;
      iyziCommissionRateAmount: number;
      iyziCommissionFee: number;
      blockageRateAmountMerchant: number;
      blockageRateAmountSubMerchant: number;
      subMerchantPayoutAmount: number;
      merchantPayoutAmount: number;
      iyziConversionRate: number;
      iyziConversionRateAmount: number;
      currency: string;
    };
  }[];
  authCode: string;
  phase: "AUTH";
  mdStatus: 1;
  hostReference: string;
}
export interface FailedPaymentResponse {
  status: "failure";
  errorCode: string;
  errorMessage: string;
  errorGroup: string;
  locale: string;
  systemTime: number;
  price?: number;
  paidPrice?: number;
  installment?: number;
  paymentId?: string;
  basketId?: string;
  currency?: string;
}
// Birleşik tip
type Initialize3DSResponse =
  | Initialize3DSSuccessResponse
  | Initialize3DSErrorResponse;

// Client class'ı sadece initialize3DS için özelleştirilmiş
// Bin Check Response Interface
interface BinResponse {
  status: string;
  locale: string;
  systemTime: number;
  conversationId: string;
  binNumber: string;
  cardType: string;
  cardAssociation: string;
  cardFamily: string;
  bankName: string;
  bankCode: number;
  commercial: number;
}
import CryptoJS from "crypto-js";

export class IyzicoClient {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.API_KEY_IYZICO;
    const secretKey = process.env.SECRET_KEY_IYZICO;
    const baseUrl = process.env.BASE_URL;

    if (!apiKey || !secretKey || !baseUrl) {
      throw new Error(
        "Iyzico credentials are missing in environment variables",
      );
    }

    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  private generateRandomString(): string {
    return Math.ceil(
      Math.random() * (999999999 - 100000000) + 100000000,
    ).toString();
  }

  private generateAuthorizationHeader(path: string, request: object): string {
    const randomKey =
      new Date().getTime().toString() + this.generateRandomString();
    const payload = randomKey + path + JSON.stringify(request);
    const signature = CryptoJS.HmacSHA256(payload, this.secretKey).toString();
    const authString = `apiKey:${this.apiKey}&randomKey:${randomKey}&signature:${signature}`;
    const base64Auth = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(authString),
    );
    return `IYZWSv2 ${base64Auth}`;
  }

  protected async request<T>(
    path: string,
    method: string,
    body: object,
  ): Promise<T> {
    const authorization = this.generateAuthorizationHeader(path, body);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: authorization,
          "x-iyzi-rnd": this.generateRandomString(),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage || "Iyzico request failed");
      }
      return response.json();
    } catch (error) {
      console.error("Iyzico API Error:", error);
      throw error;
    }
  }

  // Yeni eklenen BIN check metodu
  async checkBin(
    binNumber: string,
    conversationId: string,
  ): Promise<BinResponse> {
    return this.request<BinResponse>("/payment/bin/check", "POST", {
      binNumber,
      locale: "tr",
      conversationId,
    });
  }

  async initialize3DS(paymentRequest): Promise<Initialize3DSResponse> {
    return this.request<Initialize3DSResponse>(
      "/payment/3dsecure/initialize",
      "POST",
      paymentRequest,
    );
  }

  async create3DPayment(
    paymentRequest,
  ): Promise<SuccessfulPaymentResponse | FailedPaymentResponse> {
    return this.request("/payment/3dsecure/auth", "POST", paymentRequest);
  }

  async createPayment(paymentRequest): Promise<unknown> {
    return this.request("/payment/auth", "POST", paymentRequest);
  }

  async checkPaymentStatus(paymentId: string): Promise<unknown> {
    return this.request("/payment/detail", "POST", { paymentId });
  }
}

export const iyzico = new IyzicoClient();
