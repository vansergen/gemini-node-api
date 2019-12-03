import * as Promise from "bluebird";
import { EventEmitter } from "events";

declare module "gemini-node-api" {
  export type callback<T> = (error: any, data: T) => void;

  export type JSONObject = {
    [key: string]: any;
  };

  export type GetOptions = {
    uri: string;
  } & JSONObject;

  export type PostOptions = {
    request: string;
  } & JSONObject;

  export type RequestOptions = {
    method: "GET" | "POST";
    headers?: JSONObject;
  } & GetOptions;

  export type SymbolFilter = {
    symbol?: string;
  };

  export type ConfirmClearingOptions = {
    clearing_id: string;
    symbol?: string;
    amount: number;
    price: number;
    side: "buy" | "sell";
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

  export type Auth = {
    key: string;
    secret: string;
  };

  export type RequestResponse =
    | JSONObject
    | JSONObject[]
    | JSONObject[][]
    | string[]
    | number[][];

  export type ConfirmClearingOptionsResponse = {
    result: "confirmed";
  };

  export type PublicClientOptions = {
    symbol?: string;
    sandbox?: boolean;
    api_uri?: string;
    timeout?: number;
  };

  export type AuthenticatedClientOptions = Auth & PublicClientOptions;

  export type WebsocketClientOptions = {
    symbol?: string;
    sandbox?: boolean;
    api_uri?: string;
    key?: string;
    secret?: string;
  };

  export class PublicClient {
    get(options: GetOptions): Promise<RequestResponse>;

    request(options: RequestOptions): Promise<RequestResponse>;
  }

  export class AuthenticatedClient extends PublicClient {
    constructor(options: AuthenticatedClientOptions);

    post(options: PostOptions): Promise<RequestResponse>;

    confirmClearingOrder(
      options: ConfirmClearingOptions
    ): Promise<ConfirmClearingOptionsResponse>;
  }

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
