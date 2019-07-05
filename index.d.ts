import * as Promise from 'bluebird';

declare module 'gemini-node-api' {
  export type callback<T> = (error: any, data: T) => void;

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

  export type RequestResponse =
    | JSONObject
    | JSONObject[]
    | JSONObject[][]
    | string[];

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

  export type NotionalOneDay = {
    date: string;
    notional_volume: number;
  };

  export type NotionalVolume = {
    account_id?: number;
    date: string;
    last_updated_ms: number;
    web_maker_fee_bps: number;
    web_taker_fee_bps: number;
    web_auction_fee_bps: number;
    api_maker_fee_bps: number;
    api_taker_fee_bps: number;
    api_auction_fee_bps: number;
    fix_maker_fee_bps: number;
    fix_taker_fee_bps: number;
    fix_auction_fee_bps: number;
    block_maker_fee_bps: number;
    block_taker_fee_bps: number;
    notional_30d_volume: number;
    notional_1d_volume: NotionalOneDay[];
  };

  export type TradeVolume = {
    account_id: number;
    symbol: string;
    base_currency: string;
    notional_currency: string;
    data_date: string;
    total_volume_base: number;
    maker_buy_sell_ratio: number;
    buy_maker_base: number;
    buy_maker_notional: number;
    buy_maker_count: number;
    sell_maker_base: number;
    sell_maker_notional: number;
    sell_maker_count: number;
    buy_taker_base: number;
    buy_taker_notional: number;
    buy_taker_count: number;
    sell_taker_base: number;
    sell_taker_notional: number;
    sell_taker_count: number;
  };

  export type Balance = {
    type: 'exchage';
    currency: string;
    amount: string;
    available: string;
    availableForWithdrawal: string;
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

    cb(method: string, callback: callback<any>, options?: JSONObject);

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

    getNotionalVolume(): Promise<NotionalVolume>;

    getTradeVolume(): Promise<TradeVolume[][]>;

    getAvailableBalances(): Promise<Balance[]>;
  }

  export function SignRequest(auth: Auth, payload?: JSONObject): AuthHeaders;
}
