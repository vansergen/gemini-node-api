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

export type CandlesFilter = SymbolFilter & {
  time_frame?: "1m" | "5m" | "15m" | "30m" | "1hr" | "6hr" | "1day";
};

export type BookFilter = {
  limit_bids?: number;
  limit_asks?: number;
} & SymbolFilter;

export type TradeHistoryFilter = SymbolFilter & {
  timestamp?: number;
  limit_trades?: number;
  include_breaks?: boolean;
};

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

export type Candle = [number, number, number, number, number, number];

export type BookEntry = {
  price: string;
  amount: string;
  timestamp: string;
};

export type OrderBook = {
  bids: BookEntry[];
  asks: BookEntry[];
};

export type Trade = {
  timestamp: number;
  timestampms: number;
  tid: number;
  price: string;
  amount: string;
  exchange: "gemini";
  type: "buy" | "sell" | "auction" | "block";
  broken?: boolean;
};

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

  /**
   * Get time-intervaled data for the provided symbol.
   */
  getCandles({
    symbol = this.symbol,
    time_frame = "1day"
  }: CandlesFilter = {}): BPromise<Candle[]> {
    return this.get({ uri: "v2/candles/" + symbol + "/" + time_frame });
  }

  /**
   * Get the current order book.
   */
  getOrderBook({ symbol = this.symbol, ...qs }: BookFilter = {}): BPromise<
    OrderBook
  > {
    return this.get({ uri: "v1/book/" + symbol, qs });
  }

  /**
   * Get the trades that have executed since the specified timestamp.
   */
  getTradeHistory({
    symbol = this.symbol,
    limit_trades = ApiLimit,
    ...qs
  }: TradeHistoryFilter = {}): BPromise<Trade[]> {
    const uri = "v1/trades/" + symbol;
    return this.get({ uri, qs: { limit_trades, ...qs } });
  }
}
