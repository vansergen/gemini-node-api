import { RPC } from "rpc-bluebird";
import * as Promise from "bluebird";

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
  "Cache-Control": "no-cache",
};

export type SymbolFilter = { symbol?: string };

export type TickerFilter = SymbolFilter & { v?: "v1" | "v2" };

export type CandlesFilter = SymbolFilter & {
  time_frame?: "1m" | "5m" | "15m" | "30m" | "1hr" | "6hr" | "1day";
};

export type BookFilter = SymbolFilter & {
  limit_bids?: number;
  limit_asks?: number;
};

export type TradeHistoryFilter = SymbolFilter & {
  timestamp?: number;
  limit_trades?: number;
  include_breaks?: boolean;
};

export type AuctionHistoryFilter = SymbolFilter & {
  timestamp?: number;
  limit_auction_results?: number;
  include_indicative?: boolean;
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

export type OrderBook = { bids: BookEntry[]; asks: BookEntry[] };

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

export type AuctionInfo = {
  closed_until_ms?: number;
  last_auction_eid?: number;
  last_auction_price?: string;
  last_auction_quantity?: string;
  last_highest_bid_price?: string;
  last_lowest_ask_price?: string;
  last_collar_price?: string;
  most_recent_indicative_price?: string;
  most_recent_indicative_quantity?: string;
  most_recent_highest_bid_price?: string;
  most_recent_lowest_ask_price?: string;
  most_recent_collar_price?: string;
  next_update_ms?: number;
  next_auction_ms?: number;
};

export type AuctionHistory = {
  timestamp: number;
  timestampms: number;
  auction_id: number;
  eid: number;
  event_type: "indicative" | "auction";
  auction_result: "success" | "failure";
  auction_price?: string;
  auction_quantity?: string;
  highest_bid_price?: string;
  lowest_ask_price?: string;
  collar_price?: string;
  unmatched_collar_quantity?: string;
};

export type PriceFeedItem = {
  pair: string;
  price: string;
  percentChange24h: string;
};

export type PublicClientOptions = {
  symbol?: string;
  sandbox?: boolean;
  apiUri?: string;
  timeout?: number;
};

export class PublicClient extends RPC {
  readonly symbol: string;

  constructor({
    symbol = DefaultSymbol,
    sandbox = false,
    apiUri = sandbox ? SandboxApiUri : ApiUri,
    timeout = DefaulTimeout,
  }: PublicClientOptions = {}) {
    super({ json: true, timeout, baseUrl: apiUri, headers: Headers });
    this.symbol = symbol;
  }

  /**
   * Get all available symbols for trading.
   */
  getSymbols(): Promise<string[]> {
    return this.get({ uri: "v1/symbols" });
  }

  /**
   * Get information about recent trading activity for the symbol.
   */
  getTicker({
    symbol = this.symbol,
    v = "v1",
  }: TickerFilter = {}): Promise<Ticker> {
    v += v === "v1" ? "/pubticker/" + symbol : "/ticker/" + symbol;
    return this.get({ uri: v });
  }

  /**
   * Get time-intervaled data for the provided symbol.
   */
  getCandles({
    symbol = this.symbol,
    time_frame = "1day",
  }: CandlesFilter = {}): Promise<Candle[]> {
    return this.get({ uri: "v2/candles/" + symbol + "/" + time_frame });
  }

  /**
   * Get the current order book.
   */
  getOrderBook({
    symbol = this.symbol,
    ...qs
  }: BookFilter = {}): Promise<OrderBook> {
    return this.get({ uri: "v1/book/" + symbol, qs });
  }

  /**
   * Get the trades that have executed since the specified timestamp.
   */
  getTradeHistory({
    symbol = this.symbol,
    limit_trades = ApiLimit,
    ...qs
  }: TradeHistoryFilter = {}): Promise<Trade[]> {
    const uri = "v1/trades/" + symbol;
    return this.get({ uri, qs: { limit_trades, ...qs } });
  }

  /**
   * Get current auction information.
   */
  getCurrentAuction({
    symbol = this.symbol,
  }: SymbolFilter = {}): Promise<AuctionInfo> {
    return this.get({ uri: "v1/auction/" + symbol });
  }

  /**
   * Get the auction events.
   */
  getAuctionHistory({
    symbol = this.symbol,
    limit_auction_results = ApiLimit,
    ...qs
  }: AuctionHistoryFilter = {}): Promise<AuctionHistory[]> {
    const uri = "v1/auction/" + symbol + "/history";
    return this.get({ uri, qs: { limit_auction_results, ...qs } });
  }

  /**
   * Get the price feed.
   */
  getPriceFeed(): Promise<PriceFeedItem[]> {
    return this.get({ uri: "v1/pricefeed" });
  }
}
