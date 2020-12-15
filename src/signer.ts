import * as crypto from "crypto";

export type SignerOptions = { key: string; secret: string; options: object };

export type AuthHeaders = {
  "X-GEMINI-PAYLOAD": string;
  "X-GEMINI-SIGNATURE": string;
  "X-GEMINI-APIKEY": string;
};

export function SignRequest({
  key,
  secret,
  options,
}: SignerOptions): AuthHeaders {
  const payload = Buffer.from(JSON.stringify(options)).toString("base64");
  return {
    "X-GEMINI-PAYLOAD": payload,
    "X-GEMINI-SIGNATURE": crypto
      .createHmac("sha384", secret)
      .update(payload)
      .digest("hex"),
    "X-GEMINI-APIKEY": key,
  };
}
