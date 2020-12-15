import { Server, VerifyClientCallbackSync } from "ws";
import { SignRequest } from "../../";
import { parse } from "querystring";

type WSSOptions = { port: number; key?: string; secret?: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VerifyProps(qs: { [key: string]: any }, allowed: string[]): boolean {
  for (const prop in qs) {
    const check = allowed.find(
      (o) =>
        prop === o &&
        (qs[prop] === "true" || qs[prop] === "false" || qs[prop] === "")
    );
    if (!check) {
      return false;
    }
  }
  return true;
}

export function WSS({ port, key, secret }: WSSOptions): Server {
  const verifyClient: VerifyClientCallbackSync = ({ req }) => {
    if (!req.url) {
      return false;
    }
    const [, v, type, path] = req.url.split("/");
    if (!path) {
      return v === "v2" && type === "marketdata";
    }
    const [symbol, query] = path.split("?");
    const qs = parse(query);
    if (v === "v1" && type === "marketdata") {
      return VerifyProps(qs, [
        "heartbeat",
        "trades",
        "bids",
        "offers",
        "top_of_book",
        "auctions",
      ]);
    } else if (type === "order" && symbol === "events" && v === "v1") {
      if (!key || !secret) {
        return false;
      }
      const providedSignature = req.headers["x-gemini-signature"];
      const providedKey = req.headers["x-gemini-apikey"];
      const providedPayload = req.headers["x-gemini-payload"];
      if (
        typeof providedSignature !== "string" ||
        typeof providedKey !== "string" ||
        typeof providedPayload !== "string"
      ) {
        return false;
      }
      const payload: { request?: string; nonce?: number } = JSON.parse(
        Buffer.from(providedPayload, "base64").toString()
      );
      if (payload.request !== "/v1/order/events" || !payload.nonce) {
        return false;
      }
      const headers = SignRequest({ key, secret, options: payload });
      const requiredSignature = headers["X-GEMINI-SIGNATURE"];
      const checkQS = VerifyProps(qs, [
        "symbolFilter",
        "apiSessionFilter",
        "eventTypeFilter",
      ]);
      return (
        providedSignature === requiredSignature &&
        providedKey === key &&
        checkQS
      );
    }
    return false;
  };

  return new Server({ port, verifyClient });
}
