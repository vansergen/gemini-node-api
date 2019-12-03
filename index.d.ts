import * as Promise from "bluebird";
import { EventEmitter } from "events";

declare module "gemini-node-api" {
  export type SymbolFilter = {
    symbol?: string;
  };

  export type WSMarketOptions = {
    symbol?: string;
    heartbeat?: boolean;
    top_of_book?: boolean;
    bids?: boolean;
    offers?: boolean;
    trades?: boolean;
    auctions?: boolean;
  };

  export type WSOrderOptions = {
    symbolFilter?: string | string[];
    apiSessionFilter?: string | string[];
    eventTypeFilter?: string | string[];
  };

  export type Subscription = {
    name: string;
    symbols?: string[];
  };

  export type WebsocketClientOptions = {
    symbol?: string;
    sandbox?: boolean;
    api_uri?: string;
    key?: string;
    secret?: string;
  };

  export class WebsocketClient extends EventEmitter {
    constructor(options?: WebsocketClientOptions);

    connectMarket(options?: WSMarketOptions): void;

    connect(): void;

    connectOrders(options?: WSOrderOptions): void;

    disconnectMarket(options?: SymbolFilter): void;

    disconnect(): void;

    disconnectOrders(): void;

    subscribe(options: Subscription | Subscription[]): void;

    unsubscribe(options: Subscription | Subscription[]): void;

    on(event: "message", listener: (data: any, market: string) => void): this;
    on(event: "error", listener: (error: any, market: string) => void): this;
    on(event: "open", listener: (market: string) => void): this;
    on(event: "close", listener: (market: string) => void): this;
  }
}
