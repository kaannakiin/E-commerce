import { createId } from "@paralleldrive/cuid2";
import CryptoJS from "crypto-js";
import {
  BinResponse,
  Check3D,
  ErrorPaymentResponse,
  IyzicoRefundResponse,
  paymentRequest,
  Success3DPaymentResponse,
  SuccessPaymentResponse,
} from "./types";
export class IyzicoClient {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const baseUrl = process.env.IYZICO_BASE_URL;

    if (!apiKey || !secretKey || !baseUrl) {
      throw new Error(
        "Iyzico credentials are missing in environment variables",
      );
    }

    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  private generateAuthorizationHeader(path: string, request: object): string {
    const randomKey = new Date().getTime().toString() + createId();
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
          "x-iyzi-rnd": createId(),
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

  async checkBin(binNumber: string): Promise<BinResponse> {
    return this.request<BinResponse>("/payment/bin/check", "POST", {
      binNumber,
      locale: "tr",
    });
  }
  async paymentNon3D(
    paymentRequest: paymentRequest,
  ): Promise<ErrorPaymentResponse | SuccessPaymentResponse> {
    return this.request("/payment/auth", "POST", paymentRequest);
  }
  async payment3D(
    paymentRequest: paymentRequest,
  ): Promise<ErrorPaymentResponse | Success3DPaymentResponse> {
    return this.request("/payment/3dsecure/initialize", "POST", paymentRequest);
  }
  async check3D(
    paymentRequest: Check3D,
  ): Promise<ErrorPaymentResponse | SuccessPaymentResponse> {
    return this.request("/payment/3dsecure/auth", "POST", paymentRequest);
  }
  async paymentDetail(request) {
    return this.request("/payment/detail", "POST", request);
  }
  async refundOrderItem(request): Promise<IyzicoRefundResponse> {
    return this.request("/payment/refund", "POST", request);
  }
  async cancelOrder(request): Promise<Success3DPaymentResponse> {
    return this.request("/payment/cancel", "POST", request);
  }
}

export const iyzico = new IyzicoClient();
