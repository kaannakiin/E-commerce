import { generateJWKSignature, headers } from "@/lib/Tami/tamiHeader";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
export async function POST(req: NextRequest) {
  const orderId = uuidv4();
  const amount = 415;
  const cardNumber = "4824910501747014";
  const currency = "TRY";
  const installmentCount = 1;

  const body = {
    binNumber: "45438877",
    securityHash: "",
  };
  const securityHash = generateJWKSignature(body);
  body.securityHash = securityHash;
  console.log(body);

  const request = await fetch(
    "https://sandbox-paymentapi.tami.com.tr/payment/auth",
    {
      headers: headers,
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  const curlCommand = `curl --location '${request.url}' \\
${Object.entries(headers)
  .map(([key, value]) => `--header '${key}: ${value}' \\`)
  .join("\n")}
--data-raw '${JSON.stringify(body, null, 2)}'`;

  console.log(curlCommand);
  const response = await request.json();
  console.log("Response Data:", response);
}
