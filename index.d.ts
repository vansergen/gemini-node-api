import * as Promise from 'bluebird';

declare module 'gemini-node-api' {
  export type JSONObject = {
    [key: string]: any;
  };

  export type GetOptions = {
    uri: string;
    qs?: JSONObject;
  };

  export type PostOptions = {
    request: string;
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

  export type TradeHistoryFilter = {
    since?: number;
    limit_trades?: number;
    include_breaks?: boolean;
  } & SymbolFilter;

  export type AuctionHistoryFilter = {
    since?: number;
    limit_auction_results?: number;
    include_indicative?: boolean;
  } & SymbolFilter;

  export type Auth = {
    key: string;
    secret: string;
  };

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

  export type Trade = {
    timestamp: number;
    timestampms: number;
    tid: number;
    price: string;
    amount: string;
    exchange: 'gemini';
    type: 'buy' | 'sell' | 'auction' | 'block';
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
    event_type: 'indicative' | 'auction';
    auction_result: 'success' | 'failure';
    auction_price?: string;
    auction_quantity?: string;
    highest_bid_price?: string;
    lowest_ask_price?: string;
    collar_price?: string;
    unmatched_collar_quantity?: string;
  };

  export type AuthHeaders = {
    'X-GEMINI-PAYLOAD': string;
    'X-GEMINI-SIGNATURE': string;
    'X-GEMINI-APIKEY': string;
  };

  export type PublicClientOptions = {
    symbol?: string;
    sandbox?: boolean;
    api_uri?: string;
    timeout?: number;
  };

  export type AuthenticatedClientOptions = Auth & PublicClientOptions;

  export class PublicClient {
    constructor(options?: PublicClientOptions);

    get(options: GetOptions): Promise<RequestResponse>;

    request(options: RequestOptions): Promise<RequestResponse>;

    getSymbols(): Promise<string[]>;

    getTicker(options?: SymbolFilter): Promise<Ticker>;

    getOrderBook(options?: BookFilter): Promise<OrderBook>;

    getTradeHistory(options?: TradeHistoryFilter): Promise<Trade[]>;

    getCurrentAuction(options?: SymbolFilter): Promise<AuctionInfo>;

    getAuctionHistory(
      options?: AuctionHistoryFilter
    ): Promise<AuctionHistory[]>;
  }

  export class AuthenticatedClient extends PublicClient {
    constructor(options: AuthenticatedClientOptions);

    post(options: PostOptions): Promise<RequestResponse>;
  }

  export function SignRequest(auth: Auth, payload?: JSONObject): AuthHeaders;
}
