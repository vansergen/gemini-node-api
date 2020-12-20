import { createHmac } from "crypto";

export interface SignerOptions {
  key: string;
  secret: string;
  payload: string;
}

export interface AuthHeaders {
  "X-GEMINI-PAYLOAD": string;
  "X-GEMINI-SIGNATURE": string;
  "X-GEMINI-APIKEY": string;
}

export function SignRequest({
  key,
  secret,
  payload,
}: SignerOptions): AuthHeaders {
  const signature = createHmac("sha384", secret).update(payload).digest("hex");
  return {
    "X-GEMINI-PAYLOAD": payload,
    "X-GEMINI-SIGNATURE": signature,
    "X-GEMINI-APIKEY": key,
  };
}
