// payment-client.ts
import crypto from "crypto";

class PaymentClient {
  private static instance: PaymentClient;
  private merchantNumber;
  private terminalNumber;
  private secretKey;
  private fixedKidValue;
  private fixedKValue;
  private baseUrl;

  private constructor() {
    this.merchantNumber = process.env.TAMI_MERCHANT_NUMBER;
    this.terminalNumber = process.env.TAMI_TERMINAL_NUMBER;
    this.secretKey = process.env.TAMI_SECRET_KEY;
    this.fixedKidValue = process.env.TAMI_FIXED_KID_VALUE;
    this.fixedKValue = process.env.TAMI_FIXED_K_VALUE;
    this.baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://paymentapi.tami.com.tr"
        : "https://sandbox-paymentapi.tami.com.tr";
  }

  public static getInstance(): PaymentClient {
    if (!PaymentClient.instance) {
      PaymentClient.instance = new PaymentClient();
    }
    return PaymentClient.instance;
  }

  private generateKidValue() {
    const input = this.secretKey + this.fixedKidValue;
    const hash = crypto.createHash("sha512");
    hash.update(input);
    return hash.digest("base64");
  }

  private generateKValue() {
    const input =
      this.secretKey +
      this.fixedKValue +
      this.merchantNumber +
      this.terminalNumber;
    const hash = crypto.createHash("sha512");
    hash.update(input);
    return hash.digest("base64");
  }

  private async generateSecurityHash(payload) {
    // JWK oluşturma
    const jwk = {
      kty: "oct",
      use: "sig",
      kid: this.generateKidValue(),
      k: this.generateKValue(),
      alg: "HS512",
    };

    // Header
    const header = {
      kid: jwk.kid,
      typ: "JWT",
      alg: "HS512",
    };

    // Sadece binNumber ile hash oluştur
    const payloadForHash = {
      binNumber: payload.binNumber,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payloadForHash)).toString(
      "base64url",
    );

    const signature = crypto
      .createHmac("sha512", Buffer.from(jwk.k, "base64"))
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private generateAuthToken() {
    const input = `${this.merchantNumber}${this.terminalNumber}${this.secretKey}`;
    const hash = crypto.createHash("sha256").update(input).digest("base64");
    return `${this.merchantNumber}:${this.terminalNumber}:${hash}`;
  }
  private async request(endpoint, method, body) {
    // Sadece binNumber içeren payload
    const payload = {
      binNumber: body.binNumber,
    };

    const securityHash = await this.generateSecurityHash(payload);

    // Final request - sadece gerekli alanlar
    const finalRequest = {
      binNumber: body.binNumber,
      securityHash,
    };

    const correlationId = crypto.randomUUID();
    const headers = {
      "Accept-Language": "tr",
      correlationId: "correlation" + correlationId,
      "PG-Auth-Token": this.generateAuthToken(),
      "PG-Api-Version": "v2",
      "Content-Type": "application/json",
    };

    console.log("Final Request:", JSON.stringify(finalRequest, null, 2));
    console.log("Headers:", headers);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: JSON.stringify(finalRequest),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Response Error:", responseData);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${JSON.stringify(responseData)}`,
      );
    }

    return responseData;
  }
  async binCheck(binNumber: string) {
    return this.request("/installment/bin-info", "POST", { binNumber });
  }
}

export const TamiClient = PaymentClient.getInstance();
