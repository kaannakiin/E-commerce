import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const FIXED_K_VALUE = process.env.FIXED_K_VALUE;
const FIXED_KID_VALUE = process.env.FIXED_KID_VALUE;
const SECRET_KEY = process.env.TAMI_SECRET_KEY;
const TERMINAL_NUMBER = process.env.TAMI_TERMINAL_NUMBER;
const MERCHANT_NUMBER = process.env.TAMI_MERCHANT_NUMBER;

function getJWKResource() {
  return {
    kty: "oct",
    use: "sig",
    alg: "HS512",
    kid: generateKidValue(),
    k: generateKValue(),
  };
}

function generateKidValue() {
  const hash = crypto.createHash("sha512");
  hash.update(SECRET_KEY + FIXED_KID_VALUE, "utf8");
  return hash.digest("base64");
}

function generateKValue() {
  const hash = crypto.createHash("sha512");
  hash.update(
    SECRET_KEY + FIXED_K_VALUE + MERCHANT_NUMBER + TERMINAL_NUMBER,
    "utf8",
  );
  return hash.digest("base64");
}

function generateJWKSignature(input) {
  const jwkResource = getJWKResource();
  const header = {
    kid: jwkResource.kid,
    typ: "JWT",
    alg: jwkResource.alg,
  };

  const headerBase64 = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const payloadBase64 = base64UrlEncode(Buffer.from(JSON.stringify(input)));
  const dataToSign = `${headerBase64}.${payloadBase64}`;

  const signature = crypto
    .createHmac("sha512", Buffer.from(jwkResource.k, "base64"))
    .update(dataToSign)
    .digest();

  return `${dataToSign}.${base64UrlEncode(signature)}`;
}

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateAuthToken() {
  const hash = crypto.createHash("sha512");
  hash.update(MERCHANT_NUMBER + TERMINAL_NUMBER + SECRET_KEY);
  return base64UrlEncode(hash.digest());
}

const headers = {
  "Content-Type": "application/json",
  "Accept-Language": "tr",
  "PG-Api-Version": "v2",
  "PG-Auth-Token": `${MERCHANT_NUMBER}:${TERMINAL_NUMBER}:${generateAuthToken()}`,
  correlationId: `${uuidv4()}`,
};

export { generateJWKSignature, headers };
