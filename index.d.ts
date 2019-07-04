import * as Promise from 'bluebird';

declare module 'gemini-node-api' {
  export type JSONObject = {
    [key: string]: any;
  };

  export type GetOptions = {
    uri: string;
    qs?: JSONObject;
  };

  export type RequestOptions = {
    method: 'GET' | 'POST';
    headers?: JSONObject;
  } & GetOptions;

  export type SymbolFilter = {
    symbol?: string;
  };

  export type BookFilter = {
    limit_bids?: number;
    limit_asks?: number;
  } & SymbolFilter;

  export type RequestResponse = JSONObject | JSONObject[] | string[];

  export type Ticker = {
    bid: string;
    ask: string;
    last: string;
    volume: JSONObject;
  };

  export type BookEntry = {
    price: string;
    amount: string;
    timestamp: string;
  };

  export type OrderBook = {
    bids: BookEntry[];
    asks: BookEntry[];
  };

  export type PublicClientOptions = {
    symbol?: string;
    sandbox?: boolean;
    api_uri?: string;
    timeout?: number;
  };

  export class PublicClient {
    constructor(options?: PublicClientOptions);

    get(options: GetOptions): Promise<RequestResponse>;

    request(options: RequestOptions): Promise<RequestResponse>;

    getSymbols(): Promise<string[]>;

    getTicker(options?: SymbolFilter): Promise<Ticker>;

    getOrderBook(options?: BookFilter): Promise<OrderBook>;
  }
}
