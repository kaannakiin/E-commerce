import crypto from "crypto";

// Interfaces
interface PaymentClientConfig {
  merchantNumber: string;
  terminalNumber: string;
  secretKey: string;
  fixedKidValue: string;
  fixedKValue: string;
}

interface BinCheckPayload {
  binNumber: string;
}

interface JWK {
  kty: "oct";
  use: "sig";
  kid: string;
  k: string;
  alg: "HS512";
}

interface JWTHeader {
  kid: string;
  typ: "JWT";
  alg: "HS512";
}

interface APIResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class PaymentClientError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
  ) {
    super(message);
    this.name = "PaymentClientError";
  }
}

class PaymentClient {
  private static instance: PaymentClient;
  private readonly merchantNumber: string;
  private readonly terminalNumber: string;
  private readonly secretKey: string;
  private readonly fixedKidValue: string;
  private readonly fixedKValue: string;
  private readonly baseUrl: string;

  private constructor() {
    // Environment variables validation
    const requiredEnvVars = {
      TAMI_MERCHANT_NUMBER: process.env.TAMI_MERCHANT_NUMBER,
      TAMI_TERMINAL_NUMBER: process.env.TAMI_TERMINAL_NUMBER,
      TAMI_SECRET_KEY: process.env.TAMI_SECRET_KEY,
      TAMI_FIXED_KID_VALUE: process.env.TAMI_FIXED_KID_VALUE,
      TAMI_FIXED_K_VALUE: process.env.TAMI_FIXED_K_VALUE,
    };

    // Check for missing environment variables
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new PaymentClientError(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
    }

    this.merchantNumber = requiredEnvVars.TAMI_MERCHANT_NUMBER!;
    this.terminalNumber = requiredEnvVars.TAMI_TERMINAL_NUMBER!;
    this.secretKey = requiredEnvVars.TAMI_SECRET_KEY!;
    this.fixedKidValue = requiredEnvVars.TAMI_FIXED_KID_VALUE!;
    this.fixedKValue = requiredEnvVars.TAMI_FIXED_K_VALUE!;
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

  private base64UrlEncode(buffer: Buffer): string {
    return buffer
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  private generateKidValue(): string {
    try {
      const input = this.secretKey + this.fixedKidValue;
      const hash = crypto.createHash("sha512");
      hash.update(input);
      return hash.digest("base64");
    } catch (error) {
      throw new PaymentClientError(
        "Failed to generate KID value",
        "KID_GEN_ERROR",
      );
    }
  }

  private generateKValue(): string {
    try {
      const input = `${this.secretKey}${this.fixedKValue}${this.merchantNumber}${this.terminalNumber}`;
      const hash = crypto.createHash("sha512");
      hash.update(input);
      return hash.digest("base64");
    } catch (error) {
      throw new PaymentClientError("Failed to generate K value", "K_GEN_ERROR");
    }
  }

  private async generateSecurityHash(
    payload: BinCheckPayload,
  ): Promise<string> {
    try {
      if (!payload?.binNumber) {
        throw new PaymentClientError(
          "Invalid payload: binNumber is required",
          "INVALID_PAYLOAD",
        );
      }

      const jwk: JWK = {
        kty: "oct",
        use: "sig",
        kid: this.generateKidValue(),
        k: this.generateKValue(),
        alg: "HS512",
      };

      const header: JWTHeader = {
        kid: jwk.kid,
        typ: "JWT",
        alg: "HS512",
      };

      // Key change: Serialize the entire payload object, not just binNumber
      const encodedHeader = this.base64UrlEncode(
        Buffer.from(JSON.stringify(header)),
      );
      const encodedPayload = this.base64UrlEncode(
        Buffer.from(JSON.stringify(payload)), // Changed this line
      );

      const signature = crypto
        .createHmac("sha512", Buffer.from(jwk.k, "base64"))
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest();

      const signatureBase64 = this.base64UrlEncode(signature);

      return `${encodedHeader}.${encodedPayload}.${signatureBase64}`;
    } catch (error) {
      if (error instanceof PaymentClientError) {
        throw error;
      }
      throw new PaymentClientError(
        "Failed to generate security hash",
        "HASH_GEN_ERROR",
      );
    }
  }

  private generateAuthToken(): string {
    try {
      const input = `${this.merchantNumber}${this.terminalNumber}${this.secretKey}`;
      const hash = crypto.createHash("sha256").update(input).digest("base64");
      return `${this.merchantNumber}:${this.terminalNumber}:${hash}`;
    } catch (error) {
      throw new PaymentClientError(
        "Failed to generate auth token",
        "AUTH_TOKEN_ERROR",
      );
    }
  }

  private async request<T>(
    endpoint: string,
    method: string,
    body: BinCheckPayload,
  ): Promise<T> {
    try {
      const securityHash = await this.generateSecurityHash(body);
      const correlationId = crypto.randomUUID();

      const finalRequest = {
        binNumber: body.binNumber,
        securityHash,
      };

      const headers = {
        "Accept-Language": "tr",
        correlationId: `correlation${correlationId}`,
        "PG-Auth-Token": this.generateAuthToken(),
        "PG-Api-Version": "v2",
        "Content-Type": "application/json",
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: JSON.stringify(finalRequest),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new PaymentClientError(
          `API request failed: ${responseData.message || responseData.error || JSON.stringify(responseData)}`,
          responseData.code || "API_ERROR",
          response.status,
        );
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof PaymentClientError) {
        throw error;
      }
      throw new PaymentClientError(
        error instanceof Error ? error.message : "Request failed",
        "REQUEST_ERROR",
        500,
      );
    }
  }
  public async binCheck(binNumber: string) {
    try {
      if (!binNumber || binNumber.length < 6) {
        throw new PaymentClientError(
          "Invalid BIN number: must be at least 6 digits",
          "INVALID_BIN",
        );
      }

      // BIN numarasının sadece rakamlardan oluştuğunu kontrol et
      if (!/^\d+$/.test(binNumber)) {
        throw new PaymentClientError(
          "BIN number must contain only digits",
          "INVALID_BIN_FORMAT",
        );
      }

      console.log("Starting BIN check for:", binNumber);
      const result = await this.request("/installment/bin-info", "POST", {
        binNumber,
      });
      console.log("BIN check result:", result);
      return result;
    } catch (error) {
      console.error("BIN check error:", error);
      throw error;
    }
  }
}

export const TamiClient = PaymentClient.getInstance();
