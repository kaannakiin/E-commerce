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
    const jwk = {
      kty: "oct",
      use: "sig",
      kid: this.generateKidValue(),
      k: this.generateKValue(),
      alg: "HS512",
    };

    const header = {
      kid: jwk.kid,
      typ: "JWT",
      alg: "HS512",
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      "base64url",
    );

    const signature = crypto
      .createHmac("sha512", Buffer.from(jwk.k, "base64"))
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private async request(endpoint, method, body) {
    const payloadWithoutHash = { ...body };
    delete payloadWithoutHash.securityHash;

    const securityHash = await this.generateSecurityHash(payloadWithoutHash);
    const finalRequest = { ...body, securityHash };

    const correlationId = crypto.randomUUID();
    const authToken = `${this.merchantNumber}:${this.terminalNumber}:${crypto
      .createHash("sha256")
      .update(correlationId)
      .digest("base64")}`;
    console.log(JSON.stringify(finalRequest));
    const headers = {
      "Accept-Language": "tr",
      correlationId: "correlation" + correlationId,
      "PG-Auth-Token": authToken,
      "PG-Api-Version": "v2",
      "Content-Type": "application/json",
    };
    console.log(headers);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Accept-Language": "tr",
        correlationId: "correlation" + correlationId,
        "PG-Auth-Token": authToken,
        "PG-Api-Version": "v2",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalRequest),
    });

    return response.json();
  }
  async binCheck(binNumber: string) {
    return this.request("/installment/bin-info", "POST", { binNumber });
  }
}

export const TamiClient = PaymentClient.getInstance();
