import Bluebird from "bluebird";
import {
  PublicClient,
  PublicClientOptions,
  SymbolFilter,
  ApiLimit,
} from "./public";
import { SignRequest } from "./signer";
import type fetch from "node-fetch";

import { UnsuccessfulFetch } from "rpc-bluebird";

export interface AccountName {
  account?: string;
}

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

export interface OrderOptions extends BasicOrderOptions {
  side: "buy" | "sell";
}

export interface OrderID extends AccountName {
  order_id: number;
}

export type PastTradesFilter = SymbolFilter & {
  limit_trades?: number;
  timestamp?: number;
} & AccountName;

export interface BaseClearingOrder extends SymbolFilter {
  amount: number;
  price: number;
  side: "buy" | "sell";
  expires_in_hrs: number;
}

export interface ClearingOrderOptions extends BaseClearingOrder {
  counterparty_id?: string;
}

export interface BrokerOrderOptions extends BaseClearingOrder {
  target_counterparty_id: string;
  source_counterparty_id: string;
}

export interface ClearingOrderID {
  clearing_id: string;
}

export interface ConfirmClearingOptions {
  clearing_id: string;
  symbol?: string;
  amount: number;
  price: number;
  side: "buy" | "sell";
}

export interface TransferFilter extends AccountName {
  timestamp?: number;
  limit_transfers?: number;
}

export interface DepositAddressesFilter extends AccountName {
  network: string;
}

export interface NewAddressFilter extends AccountName {
  currency: string;
  label?: string;
  legacy?: boolean;
}

export interface WithdrawCryptoFilter extends AccountName {
  currency: string;
  address: string;
  amount: number;
}

export interface InternalTransferFilter {
  currency: string;
  sourceAccount: string;
  targetAccount: string;
  amount: number;
}

export interface Account {
  name: string;
  type?: "exchange" | "custody";
}

export interface WithdrawGUSDFilter extends AccountName {
  address: string;
  amount: number;
}

export type OrderType =
  | "exchange limit"
  | "stop-limit"
  | "auction-only exchange limit"
  | "market buy"
  | "market sell"
  | "indication-of-interest";

export interface BaseOrder {
  side: "buy" | "sell";
  price?: string;
  symbol: string;
  order_id: string;
  client_order_id?: string;
  timestamp: string;
  timestampms: number;
  is_live: boolean;
  is_cancelled: boolean;
  is_hidden: boolean;
  remaining_amount?: string;
  original_amount?: string;
  executed_amount?: string;
}

export interface OrderStatus extends BaseOrder {
  id: string;
  exchange: "gemini";
  avg_execution_price: string;
  type: OrderType;
  options: [OrderEexecutionOptions] | [];
  reason?: string;
  was_forced: boolean;
  stop_price?: string;
}

export interface CancelOrdersResponse {
  result: "ok";
  details: { cancelledOrders: number[]; cancelRejects: number[] };
}

export interface PastTrade {
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
}

export interface NotionalVolume {
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
  notional_1d_volume: { date: string; notional_volume: number }[];
}

export interface TradeVolume {
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
}

export interface NewClearingOrderResponse {
  result: string;
  clearing_id: string;
}

export interface ClearingOrderStatus {
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
}

export interface CancelClearingOrderResponse {
  result: "ok" | "failed";
  details: string;
}

export interface ConfirmClearingOptionsResponse {
  result: "confirmed" | "error";
  reason?: string;
  message?: string;
}

export interface Balance {
  type: "exchange";
  currency: string;
  amount: string;
  available: string;
  availableForWithdrawal: string;
}

export interface NotionalBalance {
  currency: string;
  amount: string;
  amountNotional: string;
  available: string;
  availableNotional: string;
  availableForWithdrawal: string;
  availableForWithdrawalNotional: string;
}

export interface Transfer {
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
}

export interface DepositAddress {
  address: string;
  timestamp: number;
  label?: string;
}

export interface NewAddress {
  currency: string;
  address: string;
  label?: string;
}

export interface Withdrawal {
  address: string;
  amount: string;
  txHash?: string;
  withdrawalId?: string;
  message?: string;
}

export interface InternalTransferResponse {
  uuid: string;
}

export interface AccountInfo {
  name: string;
  account: string;
  type: "exchange" | "custody";
  counterparty_id: string;
  created: number;
}

export interface GUSDWithdrawal {
  destination: string;
  amount: string;
  txHash: string;
}

export interface Heartbeat {
  result: "ok";
}

export interface AuthenticatedClientOptions extends PublicClientOptions {
  key: string;
  secret: string;
}

export class AuthenticatedClient extends PublicClient {
  readonly #key: string;
  readonly #secret: string;
  #nonce: () => number;

  public constructor({ key, secret, ...rest }: AuthenticatedClientOptions) {
    super(rest);
    this.#key = key;
    this.#secret = secret;
    this.#nonce = (): number => Date.now();
  }

  public post(
    path: string | undefined,
    _options: fetch.RequestInit | undefined,
    body: { request: string } & Record<string, unknown> = { request: "/" }
  ): Bluebird<unknown> {
    body.nonce = this.nonce();
    const payload = Buffer.from(JSON.stringify(body)).toString("base64");
    const request = { key: this.#key, secret: this.#secret, payload };
    const headers = { ...SignRequest(request) };

    return new Bluebird<unknown>((resolve, reject) => {
      super
        .post(path ?? body.request, { headers })
        .then(resolve)
        .catch((error) => {
          if (error instanceof UnsuccessfulFetch) {
            error.response
              .json()
              .then((data) => {
                const { reason, message } = data as {
                  reason: string;
                  message?: string;
                };
                reject(new Error(message ?? reason));
              })
              .catch(reject);
          } else {
            reject(error);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Submit a new order.
   */
  public newOrder({
    symbol = this.symbol,
    ...rest
  }: OrderOptions): Bluebird<OrderStatus> {
    const request = "/v1/order/new";
    const body = { request, symbol, ...rest };
    return this.post(request, {}, body) as Bluebird<OrderStatus>;
  }

  /**
   * Submit a new buy order.
   */
  public buy({
    symbol = this.symbol,
    ...rest
  }: BasicOrderOptions): Bluebird<OrderStatus> {
    const request = "/v1/order/new";
    const body = { request, symbol, ...rest, side: "buy" };
    return this.post(request, {}, body) as Bluebird<OrderStatus>;
  }

  /**
   * Submit a new sell order.
   */
  public sell({
    symbol = this.symbol,
    ...rest
  }: BasicOrderOptions): Bluebird<OrderStatus> {
    const request = "/v1/order/new";
    const body = { request, symbol, ...rest, side: "sell" };
    return this.post(request, {}, body) as Bluebird<OrderStatus>;
  }

  /**
   * Cancel an order.
   */
  public cancelOrder(params: OrderID): Bluebird<OrderStatus> {
    const request = "/v1/order/cancel";
    const body = { request, ...params };
    return this.post(request, {}, body) as Bluebird<OrderStatus>;
  }

  /**
   * Cancel all orders opened by this session.
   */
  public cancelSession(account?: AccountName): Bluebird<CancelOrdersResponse> {
    const request = "/v1/order/cancel/session";
    const body = { request, ...account };
    return this.post(request, {}, body) as Bluebird<CancelOrdersResponse>;
  }

  /**
   * Cancel all outstanding orders created by all sessions owned by this account.
   */
  public cancelAll(account?: AccountName): Bluebird<CancelOrdersResponse> {
    const request = "/v1/order/cancel/all";
    const body = { request, ...account };
    return this.post(request, {}, body) as Bluebird<CancelOrdersResponse>;
  }

  /**
   * Get an order status.
   */
  public getOrderStatus(params: OrderID): Bluebird<OrderStatus> {
    const request = "/v1/order/status";
    const body = { request, ...params };
    return this.post(request, {}, body) as Bluebird<OrderStatus>;
  }

  /**
   * Get all your live orders.
   */
  public getActiveOrders(account?: AccountName): Bluebird<OrderStatus[]> {
    const request = "/v1/orders";
    const body = { request, ...account };
    return this.post(request, {}, body) as Bluebird<OrderStatus[]>;
  }

  /**
   * Get your past trades.
   */
  public getPastTrades({
    symbol = this.symbol,
    limit_trades = ApiLimit,
    ...rest
  }: PastTradesFilter = {}): Bluebird<PastTrade[]> {
    const request = "/v1/mytrades";
    const body = { request, symbol, limit_trades, ...rest };
    return this.post(request, {}, body) as Bluebird<PastTrade[]>;
  }

  /**
   * Get the volume in price currency that has been traded across all pairs over a period of 30 days.
   */
  public getNotionalVolume(account?: AccountName): Bluebird<NotionalVolume> {
    const request = "/v1/notionalvolume";
    const body = { request, ...account };
    return this.post(request, {}, body) as Bluebird<NotionalVolume>;
  }

  /**
   * Get the trade volume for each symbol.
   */
  public getTradeVolume(account?: AccountName): Bluebird<TradeVolume[][]> {
    const request = "/v1/tradevolume";
    const body = { request, ...account };
    return this.post(request, {}, body) as Bluebird<TradeVolume[][]>;
  }

  /**
   * Submit a new clearing order.
   */
  public newClearingOrder({
    symbol = this.symbol,
    ...rest
  }: ClearingOrderOptions): Bluebird<NewClearingOrderResponse> {
    const request = "/v1/clearing/new";
    const body = { request, symbol, ...rest };
    return this.post(request, {}, body) as Bluebird<NewClearingOrderResponse>;
  }

  /**
   * Submit a new broker clearing order.
   */
  public newBrokerOrder({
    symbol = this.symbol,
    ...rest
  }: BrokerOrderOptions): Bluebird<NewClearingOrderResponse> {
    const request = "/v1/clearing/broker/new";
    const body = { request, symbol, ...rest };
    return this.post(request, {}, body) as Bluebird<NewClearingOrderResponse>;
  }

  /**
   * Get a clearing order status.
   */
  public getClearingOrderStatus(
    order: ClearingOrderID
  ): Bluebird<ClearingOrderStatus> {
    const request = "/v1/clearing/status";
    const body = { request, ...order };
    return this.post(request, {}, body) as Bluebird<ClearingOrderStatus>;
  }

  /**
   * Cancel a clearing order.
   */
  public cancelClearingOrder(
    order: ClearingOrderID
  ): Bluebird<CancelClearingOrderResponse> {
    const request = "/v1/clearing/cancel";
    const body = { request, ...order };
    return this.post(
      request,
      {},
      body
    ) as Bluebird<CancelClearingOrderResponse>;
  }

  /**
   * Confirm a clearing order.
   */
  public confirmClearingOrder({
    symbol = this.symbol,
    ...rest
  }: ConfirmClearingOptions): Bluebird<ConfirmClearingOptionsResponse> {
    const request = "/v1/clearing/confirm";
    const body = { request, symbol, ...rest };
    return this.post(
      request,
      {},
      body
    ) as Bluebird<ConfirmClearingOptionsResponse>;
  }

  /**
   * Get the available balances in the supported currencies.
   */
  public getAvailableBalances(account?: AccountName): Bluebird<Balance[]> {
    const request = "/v1/balances";
    const body = { request, ...account };
    return this.post(request, {}, body) as Bluebird<Balance[]>;
  }

  /**
   * Get the available balances in the supported currencies as well as in notional USD.
   */
  public getNotionalBalances(
    account?: AccountName
  ): Bluebird<NotionalBalance[]> {
    const request = "/v1/notionalbalances/usd";
    const body = { request, ...account };
    return this.post(request, {}, body) as Bluebird<NotionalBalance[]>;
  }

  /**
   * Get deposits and withdrawals in the supported currencies.
   */
  public getTransfers(rest?: TransferFilter): Bluebird<Transfer[]> {
    const request = "/v1/transfers";
    const body = { request, ...rest };
    return this.post(request, {}, body) as Bluebird<Transfer[]>;
  }

  /**
   * Get deposit addresses.
   */
  public getDepositAddresses({
    network,
    ...rest
  }: DepositAddressesFilter): Bluebird<DepositAddress[]> {
    const request = `/v1/addresses/${network}`;
    const body = { request, ...rest };
    return this.post(request, {}, body) as Bluebird<DepositAddress[]>;
  }

  /**
   * Get a new deposit address.
   */
  public getNewAddress({
    currency,
    ...rest
  }: NewAddressFilter): Bluebird<NewAddress> {
    const request = `/v1/deposit/${currency}/newAddress`;
    const body = { request, ...rest };
    return this.post(request, {}, body) as Bluebird<NewAddress>;
  }

  /**
   * Withdraw cryptocurrency funds to a whitelisted address.
   */
  public withdrawCrypto({
    currency,
    ...rest
  }: WithdrawCryptoFilter): Bluebird<Withdrawal> {
    const request = `/v1/withdraw/${currency}`;
    const body = { request, ...rest };
    return this.post(request, {}, body) as Bluebird<Withdrawal>;
  }

  /**
   * Make an internal transfer between any two exchange accounts within the Group.
   */
  public internalTransfer({
    currency,
    ...rest
  }: InternalTransferFilter): Bluebird<InternalTransferResponse> {
    const request = `/v1/account/transfer/${currency}`;
    const body = { request, ...rest };
    return this.post(request, {}, body) as Bluebird<InternalTransferResponse>;
  }

  /**
   * Create a new exchange account within the group.
   */
  public createAccount(account: Account): Bluebird<Account> {
    const request = "/v1/account/create";
    const body = { request, ...account };
    return this.post(request, {}, body) as Bluebird<Account>;
  }

  /**
   * Get the accounts within the group.
   */
  public getAccounts(): Bluebird<AccountInfo[]> {
    const request = "/v1/account/list";
    return this.post(request, {}, { request }) as Bluebird<AccountInfo[]>;
  }

  /**
   * Withdraw `USD` as `GUSD`.
   */
  public withdrawGUSD(options: WithdrawGUSDFilter): Bluebird<GUSDWithdrawal> {
    const request = "/v1/withdraw/usd";
    const body = { request, ...options };
    return this.post(request, {}, body) as Bluebird<GUSDWithdrawal>;
  }

  /**
   * Prevent a session from timing out and canceling orders if the require heartbeat flag has been set.
   */
  public heartbeat(): Bluebird<Heartbeat> {
    const request = "/v1/heartbeat";
    return this.post(request, {}, { request }) as Bluebird<Heartbeat>;
  }

  public set nonce(nonce: () => number) {
    this.#nonce = nonce;
  }

  public get nonce(): () => number {
    return this.#nonce;
  }
}
