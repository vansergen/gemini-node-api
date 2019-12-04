import { EventEmitter } from "events";
import * as Websocket from "ws";
import { DefaultSymbol, SymbolFilter } from "./public";
import { AccountName, BaseOrder, OrderType } from "./auth";
import { SignRequest } from "./signer";
import { stringify, ParsedUrlQueryInput } from "querystring";

export const WsUri = "wss://api.gemini.com";
export const SandboxWsUri = "wss://api.sandbox.gemini.com";

export type WSMarketQS = {
  heartbeat?: boolean;
  top_of_book?: boolean;
  bids?: boolean;
  offers?: boolean;
  trades?: boolean;
  auctions?: boolean;
};

export type WSMarket = SymbolFilter & WSMarketQS;

export type WSOrderQS = {
  symbolFilter?: string | string[];
  apiSessionFilter?: string | string[];
  eventTypeFilter?: string | string[];
};

export type WSOrderOptions = WSOrderQS & AccountName;

export type WSSignerOptions = {
  request: string;
  nonce: number;
  account?: string;
};

export type Subscriptions = {
  name: string;
  symbols: string[];
}[];

export type MessageV2 = {
  type: "subscribe" | "unsubscribe";
  subscriptions: Subscriptions;
};

export type ChangeEvent = {
  type: "change";
  price: string;
  side: "bid" | "ask";
  reason: "place" | "trade" | "cancel" | "initial" | "top-of-book";
  remaining: string;
  delta?: string;
};

export type TradeEvent = {
  type: "trade";
  tid: number;
  price: string;
  amount: string;
  makerSide: "bid" | "ask" | "auction";
};

export type BlockTradeEvent = {
  type: "block_trade";
  tid: number;
  price: string;
  amount: string;
};

export type AuctionOpenEvent = {
  auction_open_ms: number;
  auction_time_ms: number;
  first_indicative_ms: number;
  last_cancel_time_ms: number;
  type: "auction_open";
};

export type AuctionResultEvent = {
  type: "auction_result";
  eid: number;
  result: "success" | "failure";
  time_ms: number;
  highest_bid_price: string;
  lowest_ask_price: string;
  collar_price: string;
  auction_price: string;
  auction_quantity: string;
};

export type AuctionIndicativeEvent = {
  type: "auction_indicative";
  eid: number;
  result: "success" | "failure";
  time_ms: number;
  highest_bid_price: string;
  lowest_ask_price: string;
  collar_price: string;
  indicative_price: string;
  indicative_quantity: string;
};

export type MarketDataEvent =
  | ChangeEvent
  | TradeEvent
  | BlockTradeEvent
  | AuctionOpenEvent
  | AuctionResultEvent
  | AuctionIndicativeEvent;

export type HeartbeatMarketMessage = {
  type: "heartbeat";
  socket_sequence: number;
};

export type InitialUpdate = {
  type: "update";
  socket_sequence: number;
  eventId: number;
  events: MarketDataEvent[];
};

export type Update = InitialUpdate & {
  timestamp?: number;
  timestampms?: number;
};

export type MarketDataMessage = HeartbeatMarketMessage | InitialUpdate | Update;

export type SubscriptionAck = {
  type: "subscription_ack";
  accountId: number;
  subscriptionId: string;
  symbolFilter: string[];
  apiSessionFilter: string[];
  eventTypeFilter: string[];
};

export type HeartbeatOrdersMessage = {
  type: "heartbeat";
  timestampms: number;
  sequence: number;
  trace_id: string;
  socket_sequence: number;
};

export type BaseWSOrder = BaseOrder & {
  api_session: string;
  socket_sequence: number;
  behavior?: OrderType;
  order_type: string;
  avg_execution_price?: string;
  total_spend?: string;
};

export type ActiveOrder = BaseWSOrder & { type: "initial" };

export type AcceptedOrder = BaseWSOrder & { type: "accepted" };

export type RejectedOrder = BaseWSOrder & { type: "rejected"; reason: string };

export type BookedOrder = BaseWSOrder & { type: "booked" };

export type FilledOrder = BaseWSOrder & {
  type: "fill";
  fill: {
    trade_id: string;
    liquidity: "Taker" | "Maker" | "Auction" | "Block" | "IndicatorOfInterest";
    price: string;
    amount: string;
    fee: string;
    fee_currency: string;
  };
};

export type CancelledOrder = BaseWSOrder & {
  type: "cancelled";
  cancel_command_id?: string;
  reason?: string;
};

export type CancelRejectedOrder = BaseWSOrder & {
  type: "cancel_rejected";
  cancel_command_id: string;
  reason: string;
};

export type ClosedOrder = BaseWSOrder & { type: "closed" };

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

export type HeartbeatMarketV2 = { type: "heartbeat"; timestamp: number };

export type L2Trade = {
  type: "trade";
  symbol: string;
  eventid: number;
  timestamp: number;
  price: string;
  quantity: string;
  side: "buy" | "sell";
};

export type L2Auction = {
  type: "auction_indicative" | "auction_result";
  symbol: string;
  time_ms: number;
  result: "success" | "failure";
  highest_bid_price: string;
  lowest_ask_price: string;
  collar_price: string;
  auction_price: string;
  auction_quantity: string;
};

export type L2Update = {
  type: "l2_updates";
  symbol: string;
  changes: ["buy" | "sell", string, string][];
};

export type L2InitialResponse = L2Update & {
  trades: L2Trade[];
  auction_events: L2Auction[];
};

export type L2Message = L2InitialResponse | L2Trade | L2Auction | L2Update;

export type CandlesType =
  | "candles_1m_updates"
  | "candles_5m_updates"
  | "candles_15m_updates"
  | "candles_30m_updates"
  | "candles_1h_updates"
  | "candles_6h_updates"
  | "candles_1d_updates";

export type CandlesUpdate = {
  type: CandlesType;
  symbol: string;
  changes: [number, number, number, number, number, number][];
};

export type MarketV2Message = L2Message | CandlesUpdate | HeartbeatMarketV2;

export type WSMessage = MarketDataMessage | OrdersMessage | MarketV2Message;

export type WebsocketClientOptions = SymbolFilter & {
  sandbox?: boolean;
  wsUri?: string;
  key?: string;
  secret?: string;
};

export declare interface WebsocketClient {
  on(event: "open", eventListener: (market: string) => void): this;
  on(event: "close", eventListener: (market: string) => void): this;
  on(
    event: "message",
    eventListener: (data: WSMessage, market: string) => void
  ): this;
  on(event: "error", eventListener: (error: any, market: string) => void): this;

  once(event: "open", eventListener: (market: string) => void): this;
  once(event: "close", eventListener: (market: string) => void): this;
  once(
    event: "message",
    eventListener: (data: WSMessage, market: string) => void
  ): this;
  once(
    event: "error",
    eventListener: (error: any, market: string) => void
  ): this;
}

export class WebsocketClient extends EventEmitter {
  readonly wsUri: string;
  readonly symbol: string;
  readonly key?: string;
  readonly secret?: string;
  private sockets: { [socket: string]: Websocket };
  _nonce?: () => number;

  constructor({
    symbol = DefaultSymbol,
    sandbox = false,
    wsUri = sandbox ? SandboxWsUri : WsUri,
    key,
    secret
  }: WebsocketClientOptions = {}) {
    super();
    this.wsUri = wsUri;
    this.symbol = symbol;
    this.sockets = {};
    if (key && secret) {
      this.key = key;
      this.secret = secret;
    }
  }

  /**
   * Connect to the public API (V1) that streams all the market data on a given symbol.
   */
  connectMarket({ symbol = this.symbol, ...qs }: WSMarket = {}): void {
    this.checkConnection(this.sockets[symbol]);
    const query = stringify(qs as ParsedUrlQueryInput);
    const uri = this.wsUri + "/v1/marketdata/" + symbol + "?" + query;
    this.addListeners((this.sockets[symbol] = new Websocket(uri)), symbol);
  }

  /**
   * Disconnect from the public API (V1).
   */
  disconnectMarket({ symbol = this.symbol }: SymbolFilter = {}): void {
    this.checkDisconnection(this.sockets[symbol]);
    this.sockets[symbol].close();
  }

  /**
   * Connect to the private API that gives you information about your orders in real time.
   */
  connectOrders({ account, ...qs }: WSOrderOptions = {}): void {
    if (!this.key || !this.secret) {
      throw new Error("`connectOrders` requires both `key` and `secret`");
    }

    this.checkConnection(this.sockets.orders);
    const query = stringify(qs as ParsedUrlQueryInput);
    const auth = { key: this.key, secret: this.secret };
    const request = "/v1/order/events";
    const options: WSSignerOptions = { request, nonce: this.nonce() };
    if (account) {
      options.account = account;
    }
    const headers = SignRequest({ ...auth, options });
    const uri = this.wsUri + request + "?" + query;
    this.sockets.orders = new Websocket(uri, { headers });
    this.addListeners(this.sockets.orders, "orders");
  }

  /**
   * Disconnect from the private API.
   */
  disconnectOrders() {
    this.checkDisconnection(this.sockets.orders);
    this.sockets.orders.close();
  }

  /**
   * Connect to the public API (V2) that can stream all market and candle data across books.
   */
  connect(): void {
    this.checkConnection(this.sockets.v2);
    this.sockets.v2 = new Websocket(this.wsUri + "/v2/marketdata");
    this.addListeners(this.sockets.v2, "v2");
  }

  /**
   * Disconnect from the public API (V2).
   */
  disconnect(): void {
    this.checkDisconnection(this.sockets.v2);
    this.sockets.v2.close();
  }

  /**
   * Subscribe from data feeds (V2).
   */
  subscribe(subscriptions: Subscriptions): void {
    this.sendMessage({ type: "subscribe", subscriptions });
  }

  /**
   * Unsubscribe from data feeds (V2).
   */
  unsubscribe(subscriptions: Subscriptions): void {
    this.sendMessage({ type: "unsubscribe", subscriptions });
  }

  private sendMessage(message: MessageV2): void {
    this.checkDisconnection(this.sockets.v2);
    this.sockets.v2.send(JSON.stringify(message));
  }

  private addListeners(socket: Websocket, symbol: string): void {
    socket.on("message", this.onMessage.bind(this, symbol));
    socket.on("open", this.onOpen.bind(this, symbol));
    socket.on("close", this.onClose.bind(this, symbol));
    socket.on("error", this.onError.bind(this, symbol));
  }

  private onMessage(symbol: string, data: any): void {
    try {
      const message = JSON.parse(data);
      this.emit("message", message, symbol);
    } catch (error) {
      this.onError(symbol, error);
    }
  }

  private onOpen(symbol: string): void {
    this.emit("open", symbol);
  }

  private onClose(symbol: string): void {
    this.emit("close", symbol);
  }

  private onError(symbol: string, error: any): void {
    if (!error) {
      return;
    }
    this.emit("error", error, symbol);
  }

  private checkConnection(socket: Websocket | undefined): void {
    if (socket) {
      switch (socket.readyState) {
        case Websocket.OPEN:
        case Websocket.CLOSING:
        case Websocket.CONNECTING:
          throw new Error("Could not connect. State: " + socket.readyState);
      }
    }
  }

  private checkDisconnection(socket: Websocket | undefined): void {
    if (!socket) {
      throw new Error("Socket was not initialized");
    }
    switch (socket.readyState) {
      case Websocket.CLOSED:
      case Websocket.CLOSING:
      case Websocket.CONNECTING:
        throw new Error("Socket state: " + socket.readyState);
    }
  }

  get nonce(): () => number {
    if (this._nonce) {
      return this._nonce;
    }
    return () => Date.now();
  }

  set nonce(nonce: () => number) {
    this._nonce = nonce;
  }
}
