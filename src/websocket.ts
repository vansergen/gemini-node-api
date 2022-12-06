import { EventEmitter } from "node:events";
import { stringify } from "node:querystring";
import Websocket from "ws";
import { AccountName, BaseOrder, OrderType } from "./auth.js";
import { DefaultSymbol, SymbolFilter, Candle } from "./public.js";
import { SignRequest } from "./signer.js";

export const WsUri = "wss://api.gemini.com";
export const SandboxWsUri = "wss://api.sandbox.gemini.com";

export interface WSMarketQS {
  heartbeat?: boolean;
  top_of_book?: boolean;
  bids?: boolean;
  offers?: boolean;
  trades?: boolean;
  auctions?: boolean;
}

export type WSMarket = SymbolFilter & WSMarketQS;

export interface WSOrderQS {
  symbolFilter?: string | string[];
  apiSessionFilter?: string | string[];
  eventTypeFilter?: string | string[];
}

export type WSOrderOptions = WSOrderQS & AccountName;

export interface WSSignerOptions {
  request: string;
  nonce: number;
  account?: string;
}

export type Subscriptions = { name: string; symbols: string[] }[];

export interface MessageV2 {
  type: "subscribe" | "unsubscribe";
  subscriptions: Subscriptions;
}

export interface ChangeEvent {
  type: "change";
  price: string;
  side: "bid" | "ask";
  reason: "place" | "trade" | "cancel" | "initial" | "top-of-book";
  remaining: string;
  delta?: string;
}

export interface TradeEvent {
  type: "trade";
  tid: number;
  price: string;
  amount: string;
  makerSide: "bid" | "ask" | "auction";
}

export interface BlockTradeEvent {
  type: "block_trade";
  tid: number;
  price: string;
  amount: string;
}

export interface AuctionOpenEvent {
  auction_open_ms: number;
  auction_time_ms: number;
  first_indicative_ms: number;
  last_cancel_time_ms: number;
  type: "auction_open";
}

export interface AuctionResultEvent {
  type: "auction_result";
  eid: number;
  result: "success" | "failure";
  time_ms: number;
  highest_bid_price: string;
  lowest_ask_price: string;
  collar_price: string;
  auction_price: string;
  auction_quantity: string;
}

export interface AuctionIndicativeEvent {
  type: "auction_indicative";
  eid: number;
  result: "success" | "failure";
  time_ms: number;
  highest_bid_price: string;
  lowest_ask_price: string;
  collar_price: string;
  indicative_price: string;
  indicative_quantity: string;
}

export type MarketDataEvent =
  | ChangeEvent
  | TradeEvent
  | BlockTradeEvent
  | AuctionOpenEvent
  | AuctionResultEvent
  | AuctionIndicativeEvent;

export interface HeartbeatMarketMessage {
  type: "heartbeat";
  socket_sequence: number;
}

export interface InitialUpdate {
  type: "update";
  socket_sequence: number;
  eventId: number;
  events: MarketDataEvent[];
}

export interface Update extends InitialUpdate {
  timestamp?: number;
  timestampms?: number;
}

export type MarketDataMessage = HeartbeatMarketMessage | InitialUpdate | Update;

export interface SubscriptionAck {
  type: "subscription_ack";
  accountId: number;
  subscriptionId: string;
  symbolFilter: string[];
  apiSessionFilter: string[];
  eventTypeFilter: string[];
}

export interface HeartbeatOrdersMessage {
  type: "heartbeat";
  timestampms: number;
  sequence: number;
  trace_id: string;
  socket_sequence: number;
}

export interface BaseWSOrder extends BaseOrder {
  api_session: string;
  socket_sequence: number;
  behavior?: OrderType;
  order_type: string;
  avg_execution_price?: string;
  total_spend?: string;
}

export interface ActiveOrder extends BaseWSOrder {
  type: "initial";
}

export interface AcceptedOrder extends BaseWSOrder {
  type: "accepted";
}

export interface RejectedOrder extends BaseWSOrder {
  type: "rejected";
  reason: string;
}

export interface BookedOrder extends BaseWSOrder {
  type: "booked";
}

export interface FilledOrder extends BaseWSOrder {
  type: "fill";
  fill: {
    trade_id: string;
    liquidity: "Taker" | "Maker" | "Auction" | "Block" | "IndicatorOfInterest";
    price: string;
    amount: string;
    fee: string;
    fee_currency: string;
  };
}

export interface CancelledOrder extends BaseWSOrder {
  type: "cancelled";
  cancel_command_id?: string;
  reason?: string;
}

export interface CancelRejectedOrder extends BaseWSOrder {
  type: "cancel_rejected";
  cancel_command_id: string;
  reason: string;
}

export interface ClosedOrder extends BaseWSOrder {
  type: "closed";
}

export type Order =
  | ActiveOrder
  | AcceptedOrder
  | RejectedOrder
  | BookedOrder
  | FilledOrder
  | CancelledOrder
  | CancelRejectedOrder
  | ClosedOrder;

export type OrdersMessage = SubscriptionAck | HeartbeatOrdersMessage | Order[];

export interface HeartbeatMarketV2 {
  type: "heartbeat";
  timestamp: number;
}

export interface L2Trade {
  type: "trade";
  symbol: string;
  eventid: number;
  timestamp: number;
  price: string;
  quantity: string;
  side: "buy" | "sell";
}

export interface L2Auction {
  type: "auction_indicative" | "auction_result";
  symbol: string;
  time_ms: number;
  result: "success" | "failure";
  highest_bid_price: string;
  lowest_ask_price: string;
  collar_price: string;
  auction_price: string;
  auction_quantity: string;
}

export interface L2Update {
  type: "l2_updates";
  symbol: string;
  changes: ["buy" | "sell", string, string][];
}

export interface L2InitialResponse extends L2Update {
  trades: L2Trade[];
  auction_events: L2Auction[];
}

export type L2Message = L2InitialResponse | L2Trade | L2Auction | L2Update;

export type CandlesType =
  | "candles_1m_updates"
  | "candles_5m_updates"
  | "candles_15m_updates"
  | "candles_30m_updates"
  | "candles_1h_updates"
  | "candles_6h_updates"
  | "candles_1d_updates";

export interface CandlesUpdate {
  type: CandlesType;
  symbol: string;
  changes: Candle[];
}

export type MarketV2Message = L2Message | CandlesUpdate | HeartbeatMarketV2;

export type WSMessage = MarketDataMessage | OrdersMessage | MarketV2Message;

export interface WebsocketClientOptions extends SymbolFilter {
  sandbox?: boolean;
  wsUri?: string;
  key?: string;
  secret?: string;
}

export declare interface WebsocketClient {
  on(event: "open" | "close", eventListener: (market: string) => void): this;
  on(
    event: "message",
    eventListener: (data: WSMessage, market: string) => void
  ): this;
  on(
    event: "error",
    eventListener: (error: unknown, market: string) => void
  ): this;

  once(event: "open" | "close", eventListener: (market: string) => void): this;
  once(
    event: "message",
    eventListener: (data: WSMessage, market: string) => void
  ): this;
  once(
    event: "error",
    eventListener: (error: unknown, market: string) => void
  ): this;
}

export class WebsocketClient extends EventEmitter {
  readonly #key?: string;
  readonly #secret?: string;
  #nonce: () => number;

  public readonly wsUri: string;
  public readonly symbol: string;
  public readonly sockets: { [socket: string]: Websocket };

  public constructor({
    symbol = DefaultSymbol,
    sandbox = false,
    wsUri = sandbox ? SandboxWsUri : WsUri,
    key,
    secret,
  }: WebsocketClientOptions = {}) {
    super();
    this.wsUri = wsUri;
    this.symbol = symbol;
    this.sockets = {};
    if (key && secret) {
      this.#key = key;
      this.#secret = secret;
    }
    this.#nonce = (): number => Math.floor(Date.now() / 1000);
  }

  /** Connect to the public API (V1) that streams all the market data on a given symbol. */
  public async connectMarket({
    symbol = this.symbol,
    ...qs
  }: WSMarket = {}): Promise<void> {
    const url = new URL(`/v1/marketdata/${symbol}`, this.wsUri);
    url.search = stringify({ ...qs });

    await this.#connectWS(symbol, url);
  }

  /** Disconnect from the public API (V1). */
  public async disconnectMarket({
    symbol = this.symbol,
  }: SymbolFilter = {}): Promise<void> {
    await this.#disconnectWS(this.sockets[symbol]);
  }

  /** Connect to the private API that gives you information about your orders in real time. */
  public async connectOrders({
    account,
    ...qs
  }: WSOrderOptions = {}): Promise<void> {
    if (!this.#key || !this.#secret) {
      throw new Error("`connectOrders` requires both `key` and `secret`");
    }

    const request = "/v1/order/events";
    const url = new URL(request, this.wsUri);
    url.search = stringify({ ...qs });

    const options: WSSignerOptions = { request, nonce: this.nonce() };
    if (account) {
      options.account = account;
    }
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");
    const signedPayload = SignRequest({
      key: this.#key,
      secret: this.#secret,
      payload,
    });

    await this.#connectWS("orders", url, { ...signedPayload });
  }

  /** Disconnect from the private API. */
  public async disconnectOrders(): Promise<void> {
    await this.#disconnectWS(this.sockets.orders);
  }

  /** Connect to the public API (V2) that can stream all market and candle data across books. */
  public async connect(): Promise<void> {
    const url = new URL("/v2/marketdata", this.wsUri);
    await this.#connectWS("v2", url);
  }

  /** Disconnect from the public API (V2). */
  public async disconnect(): Promise<void> {
    await this.#disconnectWS(this.sockets.v2);
  }

  /** Subscribe to data feeds (V2). */
  public async subscribe(subscriptions: Subscriptions): Promise<void> {
    await this.#sendMessage({ type: "subscribe", subscriptions });
  }

  /** Unsubscribe from data feeds (V2). */
  public async unsubscribe(subscriptions: Subscriptions): Promise<void> {
    await this.#sendMessage({ type: "unsubscribe", subscriptions });
  }

  async #sendMessage(data: MessageV2): Promise<void> {
    const message = JSON.stringify(data);
    const { v2: ws } = this.sockets;

    if (!ws) {
      throw new Error("Websocket is not initialized");
    }

    await new Promise<void>((resolve, reject) => {
      ws.send(message, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async #connectWS(
    symbol: string,
    url: string | URL,
    headers?: Record<string, string>
  ): Promise<void> {
    switch (this.sockets[symbol]?.readyState) {
      case Websocket.CLOSING:
      case Websocket.CONNECTING:
        throw new Error(
          `Could not connect. State: ${this.sockets[symbol].readyState}`
        );
      case Websocket.OPEN:
        return;
      default:
        break;
    }

    await new Promise<void>((resolve, reject) => {
      this.sockets[symbol] = new Websocket(url, { headers: { ...headers } });
      this.sockets[symbol]
        .once("open", resolve)
        .once("error", reject)
        .on("message", (data: string) => {
          try {
            const message = JSON.parse(data) as WSMessage;
            this.emit("message", message, symbol);
          } catch (error) {
            this.emit("error", error, symbol);
          }
        })
        .on("open", () => {
          this.emit("open", symbol);
        })
        .on("close", () => {
          this.emit("close", symbol);
        })
        .on("error", (error) => {
          if (error) {
            this.emit("error", error, symbol);
          }
        });
    });
  }

  async #disconnectWS(ws: Websocket | undefined): Promise<void> {
    switch (ws?.readyState) {
      case Websocket.CLOSED:
        return;
      case Websocket.CLOSING:
      case Websocket.CONNECTING:
        throw new Error(`Could not disconnect. State: ${ws.readyState}`);
      default:
        break;
    }

    await new Promise<void>((resolve, reject) => {
      if (!ws) {
        resolve();
      } else {
        ws.once("error", reject).once("close", resolve).close();
      }
    });
  }

  public set nonce(nonce: () => number) {
    this.#nonce = nonce;
  }

  public get nonce(): () => number {
    return this.#nonce;
  }
}
