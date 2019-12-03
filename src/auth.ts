import { RPCOptions } from "rpc-bluebird";
import { RequestPromise as Promise } from "request-promise";
import {
  PublicClient,
  PublicClientOptions,
  Headers,
  SymbolFilter,
  ApiLimit
} from "./public";
import { SignRequest } from "./signer";

export type AccountName = { account?: string };

export type OrderEexecutionOptions =
  | "maker-or-cancel"
  | "immediate-or-cancel"
  | "fill-or-kill"
  | "auction-only"
  | "indication-of-interest";

export type BasicOrderOptions = AccountName & {
  client_order_id?: string;
  amount: number;
  min_amount?: number;
  price: number;
  type: "exchange limit" | "exchange stop limit";
  options?: [OrderEexecutionOptions];
  stop_price?: number;
} & SymbolFilter;

export type OrderOptions = BasicOrderOptions & { side: "buy" | "sell" };

export type OrderID = AccountName & { order_id: number };

export type PastTradesFilter = SymbolFilter & {
  limit_trades?: number;
  timestamp?: number;
} & AccountName;

export type BaseClearingOrder = SymbolFilter & {
  amount: number;
  price: number;
  side: "buy" | "sell";
  expires_in_hrs: number;
};

export type ClearingOrderOptions = BaseClearingOrder & {
  counterparty_id?: string;
};

export type BrokerOrderOptions = BaseClearingOrder & {
  target_counterparty_id: string;
  source_counterparty_id: string;
};

export type ClearingOrderID = {
  clearing_id: string;
};

export type TransferFilter = AccountName & {
  timestamp?: number;
  limit_transfers?: number;
};

export type NewAddressFilter = AccountName & {
  currency: string;
  label?: string;
  legacy?: boolean;
};

export type WithdrawCryptoFilter = AccountName & {
  currency: string;
  address: string;
  amount: number;
};

export type InternalTransferFilter = {
  currency: string;
  sourceAccount: string;
  targetAccount: string;
  amount: number;
};

export type Account = { name: string; type?: "exchange" | "custody" };

export type WithdrawGUSDFilter = AccountName & {
  address: string;
  amount: number;
};

export type OrderStatus = {
  order_id: string;
  id: string;
  client_order_id?: string;
  symbol: string;
  exchange: "gemini";
  price?: string;
  avg_execution_price: string;
  side: "buy" | "sell";
  type:
    | "exchange limit"
    | "stop-limit"
    | "auction-only exchange limit"
    | "market buy"
    | "market sell"
    | "indication-of-interest";
  options: [OrderEexecutionOptions] | [];
  timestamp: string;
  timestampms: number;
  is_live: boolean;
  is_cancelled: boolean;
  is_hidden: boolean;
  reason?: string;
  was_forced: false;
  stop_price?: string;
  executed_amount: string;
  remaining_amount?: string;
  original_amount?: string;
};

export type CancelOrdersResponse = {
  result: "ok";
  details: {
    cancelledOrders: number[];
    cancelRejects: number[];
  };
};

export type PastTrade = {
  price: string;
  amount: string;
  timestamp: number;
  timestampms: number;
  type: "Buy" | "Sell";
  aggressor: boolean;
  fee_currency: string;
  fee_amount: string;
  tid: number;
  order_id: string;
  client_order_id?: string;
  exchange?: "gemini";
  is_auction_fill: boolean;
  break?: string;
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
  notional_1d_volume: {
    date: string;
    notional_volume: number;
  }[];
};

export type TradeVolume = {
  account_id?: number;
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

export type NewClearingOrderResponse = {
  result: string;
  clearing_id: string;
};

export type ClearingOrderStatus = {
  result: "ok";
  status:
    | "AwaitConfirm"
    | "AwaitSourceTargetConfirm"
    | "AwaitTargetConfirm"
    | "AwaitSourceConfirm"
    | "Confirmed"
    | "AttemptSettlement"
    | "Settled"
    | "Expired"
    | "Canceled"
    | "Not Found";
};

export type Balance = {
  type: "exchange";
  currency: string;
  amount: string;
  available: string;
  availableForWithdrawal: string;
};

export type Transfer = {
  type: "Deposit" | "Withdrawal";
  status: "Advanced" | "Complete";
  timestampms: number;
  eid: number;
  currency: string;
  amount: string;
  method?: "ACH" | "Wire";
  txHash?: string;
  outputIdx?: number;
  destination?: string;
  purpose?: string;
};

export type NewAddress = {
  currency: string;
  address: string;
  label?: string;
};

export type Withdrawal = {
  address: string;
  amount: string;
  txHash?: string;
  withdrawalId?: string;
  message?: string;
};

export type InternalTransferResponse = { uuid: string };

export type AccountInfo = {
  name: string;
  account: string;
  type: "exchange" | "custody";
  counterparty_id: string;
  created: number;
};

export type GUSDWithdrawal = {
  destination: string;
  amount: string;
  txHash: string;
};

export type Heartbeat = { result: "ok" };

export type AuthenticatedClientOptions = PublicClientOptions & {
  key: string;
  secret: string;
};

export class AuthenticatedClient extends PublicClient {
  readonly key: string;
  readonly secret: string;
  _nonce?: () => number;

  constructor({ key, secret, ...rest }: AuthenticatedClientOptions) {
    super(rest);
    this.key = key;
    this.secret = secret;
  }

  post({ body }: RPCOptions): Promise<any> {
    body.nonce = this.nonce();
    const uri = body.request;
    const request = { key: this.key, secret: this.secret, options: body };
    const headers = { ...Headers, ...SignRequest(request) };
    return super.post({ uri, headers });
  }

  /**
   * Submit a new order.
   */
  newOrder({
    symbol = this.symbol,
    ...body
  }: OrderOptions): Promise<OrderStatus> {
    return this.post({ body: { request: "/v1/order/new", symbol, ...body } });
  }

  /**
   * Submit a new buy order.
   */
  buy({
    symbol = this.symbol,
    ...body
  }: BasicOrderOptions): Promise<OrderStatus> {
    const request = "/v1/order/new";
    return this.post({ body: { request, symbol, ...body, side: "buy" } });
  }

  /**
   * Submit a new sell order.
   */
  sell({
    symbol = this.symbol,
    ...body
  }: BasicOrderOptions): Promise<OrderStatus> {
    const request = "/v1/order/new";
    return this.post({ body: { request, symbol, ...body, side: "sell" } });
  }

  /**
   * Cancel an order.
   */
  cancelOrder(body: OrderID): Promise<OrderStatus> {
    return this.post({ body: { request: "/v1/order/cancel", ...body } });
  }

  /**
   * Cancel all orders opened by this session.
   */
  cancelSession(body?: AccountName): Promise<CancelOrdersResponse> {
    const request = "/v1/order/cancel/session";
    return this.post({ body: { request, ...body } });
  }

  /**
   * Cancel all outstanding orders created by all sessions owned by this account.
   */
  cancelAll(body?: AccountName): Promise<CancelOrdersResponse> {
    return this.post({ body: { request: "/v1/order/cancel/all", ...body } });
  }

  /**
   * Get an order status.
   */
  getOrderStatus(body: OrderID): Promise<OrderStatus> {
    return this.post({ body: { request: "/v1/order/status", ...body } });
  }

  /**
   * Get all your live orders.
   */
  getActiveOrders(body?: AccountName): Promise<OrderStatus[]> {
    return this.post({ body: { request: "/v1/orders", ...body } });
  }

  /**
   * Get your past trades.
   */
  getPastTrades({
    symbol = this.symbol,
    limit_trades = ApiLimit,
    ...body
  }: PastTradesFilter = {}): Promise<PastTrade[]> {
    const request = "/v1/mytrades";
    return this.post({ body: { request, symbol, limit_trades, ...body } });
  }

  /**
   * Get the volume in price currency that has been traded across all pairs over a period of 30 days.
   */
  getNotionalVolume(body?: AccountName): Promise<NotionalVolume> {
    return this.post({ body: { request: "/v1/notionalvolume", ...body } });
  }

  /**
   * Get the trade volume for each symbol.
   */
  getTradeVolume(body?: AccountName): Promise<TradeVolume[][]> {
    return this.post({ body: { request: "/v1/tradevolume", ...body } });
  }

  /**
   * Submit a new clearing order.
   */
  newClearingOrder({
    symbol = this.symbol,
    ...body
  }: ClearingOrderOptions): Promise<NewClearingOrderResponse> {
    const request = "/v1/clearing/new";
    return this.post({ body: { request, symbol, ...body } });
  }

  /**
   * Submit a new broker clearing order.
   */
  newBrokerOrder({
    symbol = this.symbol,
    ...body
  }: BrokerOrderOptions): Promise<NewClearingOrderResponse> {
    const request = "/v1/clearing/broker/new";
    return this.post({ body: { request, symbol, ...body } });
  }

  /**
   * Get a clearing order status.
   */
  getClearingOrderStatus(body: ClearingOrderID): Promise<ClearingOrderStatus> {
    return this.post({ body: { request: "/v1/clearing/status", ...body } });
  }

  /**
   * Get the available balances in the supported currencies.
   */
  getAvailableBalances(body?: AccountName): Promise<Balance[]> {
    return this.post({ body: { request: "/v1/balances", ...body } });
  }

  /**
   * Get deposits and withdrawals in the supported currencies.
   */
  getTransfers(body?: TransferFilter): Promise<Transfer[]> {
    return this.post({ body: { request: "/v1/transfers", ...body } });
  }

  /**
   * Get a new deposit address.
   */
  getNewAddress({ currency, ...body }: NewAddressFilter): Promise<NewAddress> {
    const request = "/v1/deposit/" + currency + "/newAddress";
    return this.post({ body: { request, ...body } });
  }

  /**
   * Withdraw cryptocurrency funds to a whitelisted address.
   */
  withdrawCrypto({
    currency,
    ...body
  }: WithdrawCryptoFilter): Promise<Withdrawal> {
    const request = "/v1/withdraw/" + currency;
    return this.post({ body: { request, ...body } });
  }

  /**
   * Make an internal transfer between any two exchange accounts within the Group.
   */
  internalTransfer({
    currency,
    ...body
  }: InternalTransferFilter): Promise<InternalTransferResponse> {
    const request = "/v1/account/transfer/" + currency;
    return this.post({ body: { request, ...body } });
  }

  /**
   * Create a new exchange account within the group.
   */
  createAccount(body: Account): Promise<Account> {
    return this.post({ body: { request: "/v1/account/create", ...body } });
  }

  /**
   * Get the accounts within the group.
   */
  getAccounts(): Promise<AccountInfo[]> {
    return this.post({ body: { request: "/v1/account/list" } });
  }

  /**
   * Withdraw `USD` as `GUSD`.
   */
  withdrawGUSD(body: WithdrawGUSDFilter): Promise<GUSDWithdrawal> {
    return this.post({ body: { request: "/v1/withdraw/usd", ...body } });
  }

  /**
   * Prevent a session from timing out and canceling orders if the require heartbeat flag has been set.
   */
  heartbeat(): Promise<Heartbeat> {
    return this.post({ body: { request: "/v1/heartbeat" } });
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
