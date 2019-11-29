import { RPC } from "rpc-bluebird";
import { RequestPromise as BPromise } from "request-promise";

export const ApiLimit = 500;
export const DefaultSymbol = "btcusd";
export const DefaulTimeout = 30000;
export const ApiUri = "https://api.gemini.com";
export const SandboxApiUri = "https://api.sandbox.gemini.com";
export const Headers = {
  "User-Agent": "gemini-node-api-client",
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Requested-With": "XMLHttpRequest",
  "Content-Length": 0,
  "Cache-Control": "no-cache"
};

export type SymbolFilter = { symbol?: string };

export type TickerFilter = SymbolFilter & { v?: "v1" | "v2" };

export type TickerV1 = {
  bid: string;
  ask: string;
  last: string;
  volume: { [key: string]: string | number };
};

export type TickerV2 = {
  symbol: string;
  open: string;
  high: string;
  low: string;
  close: string;
  changes: string[];
  bid: string;
  ask: string;
};

export type Ticker = TickerV1 | TickerV2;

export type PublicClientOptions = {
  symbol?: string;
  sandbox?: boolean;
  apiUri?: string;
  timeout?: number;
};

export class PublicClient extends RPC {
  symbol: string;

  constructor({
    symbol = DefaultSymbol,
    sandbox = false,
    apiUri = sandbox ? ApiUri : SandboxApiUri,
    timeout = DefaulTimeout
  }: PublicClientOptions = {}) {
    super({ json: true, timeout, baseUrl: apiUri, headers: Headers });
    this.symbol = symbol;
  }

  /**
   * Get all available symbols for trading.
   */
  getSymbols(): BPromise<string[]> {
    return this.get({ uri: "v1/symbols" });
  }

  /**
   * Get information about recent trading activity for the symbol.
   */
  getTicker({ symbol = this.symbol, v = "v1" }: TickerFilter = {}): BPromise<
    Ticker
  > {
    v += v === "v1" ? "/pubticker/" + symbol : "/ticker/" + symbol;
    return this.get({ uri: v });
  }
}
