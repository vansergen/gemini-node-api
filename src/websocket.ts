import { BaseOrder, OrderType } from "./auth";

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
