import { UnsuccessfulFetch } from "rpc-request";
import {
  DefaultCurrency,
  PublicClient,
  PublicClientOptions,
  SymbolFilter,
  ApiLimit,
} from "./public.js";
import { SignRequest } from "./signer.js";
import type { RequestInit } from "node-fetch";

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
  client_order_id?: string;
  include_trades?: boolean;
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

export interface NotionalBalancesOptions extends AccountName {
  currency?: string;
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

export interface AddBankOptions extends AccountName {
  /** Account number of bank account to be added */
  accountnumber: string;
  /** Routing number of bank account to be added */
  routing: string;
  /** Type of bank account to be added */
  type: "checking" | "savings";
  /** The name of the bank account as shown on your account statements */
  name: string;
}

export interface AccountDetails {
  account: {
    accountName: string;
    shortName: string;
    type: string;
    created: string;
  };
  users: {
    name: string;
    lastSignIn: string;
    status: string;
    countryCode: string;
    isVerified: boolean;
  }[];
  memo_reference_code: string;
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
  trades?: PastTrade[];
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

export interface AddBankResponse {
  /** Reference ID for the new bank addition request. Once received, send in a wire from the requested bank account to verify it and enable withdrawals to that account. */
  referenceId: string;
}

export interface PaymentBalance {
  /** Account type. Will always be `exchange`. */
  type: "exchange";
  /**	Symbol for fiat balance. */
  currency: "USD";
  /** Total account balance for currency. */
  amount: string;
  /** Total amount available for trading */
  available: string;
  /** Total amount available for withdrawal */
  availableForWithdrawal: string;
}

export interface PaymentBank {
  /** Name of bank account */
  bank: string;
  /** Unique identifier for bank account */
  bankId: string;
}

export interface PaymentMethods {
  balances: PaymentBalance[];
  banks: PaymentBank[];
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

  public post<T = unknown>(
    path: string | undefined,
    _options: RequestInit | undefined,
    body: { request: string } & Record<string, unknown> = { request: "/" }
  ): Promise<T> {
    body.nonce = this.nonce();
    const payload = Buffer.from(JSON.stringify(body)).toString("base64");
    const request = { key: this.#key, secret: this.#secret, payload };
    const headers = { ...SignRequest(request) };

    return new Promise<T>((resolve, reject) => {
      super
        .post(path ?? body.request, { headers })
        .then((data) => {
          resolve(data as T);
        })
        .catch((error: unknown) => {
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

  /** Submit a new order. */
  public newOrder({
    symbol = this.symbol,
    ...rest
  }: OrderOptions): Promise<OrderStatus> {
    const request = "/v1/order/new";
    const body = { request, symbol, ...rest };
    return this.post<OrderStatus>(request, {}, body);
  }

  /** Submit a new buy order. */
  public buy({
    symbol = this.symbol,
    ...rest
  }: BasicOrderOptions): Promise<OrderStatus> {
    const request = "/v1/order/new";
    const body = { request, symbol, ...rest, side: "buy" };
    return this.post<OrderStatus>(request, {}, body);
  }

  /** Submit a new sell order. */
  public sell({
    symbol = this.symbol,
    ...rest
  }: BasicOrderOptions): Promise<OrderStatus> {
    const request = "/v1/order/new";
    const body = { request, symbol, ...rest, side: "sell" };
    return this.post<OrderStatus>(request, {}, body);
  }

  /** Cancel an order. */
  public cancelOrder(params: OrderID): Promise<OrderStatus> {
    const request = "/v1/order/cancel";
    const body = { request, ...params };
    return this.post<OrderStatus>(request, {}, body);
  }

  /** Cancel all orders opened by this session. */
  public cancelSession(account?: AccountName): Promise<CancelOrdersResponse> {
    const request = "/v1/order/cancel/session";
    const body = { request, ...account };
    return this.post<CancelOrdersResponse>(request, {}, body);
  }

  /** Cancel all outstanding orders created by all sessions owned by this account. */
  public cancelAll(account?: AccountName): Promise<CancelOrdersResponse> {
    const request = "/v1/order/cancel/all";
    const body = { request, ...account };
    return this.post<CancelOrdersResponse>(request, {}, body);
  }

  /** Get an order status. */
  public getOrderStatus(params: OrderID): Promise<OrderStatus> {
    const request = "/v1/order/status";
    const body = { request, ...params };
    return this.post<OrderStatus>(request, {}, body);
  }

  /** Get all your live orders. */
  public getActiveOrders(account?: AccountName): Promise<OrderStatus[]> {
    const request = "/v1/orders";
    const body = { request, ...account };
    return this.post<OrderStatus[]>(request, {}, body);
  }

  /** Get your past trades. */
  public getPastTrades({
    symbol = this.symbol,
    limit_trades = ApiLimit,
    ...rest
  }: PastTradesFilter = {}): Promise<PastTrade[]> {
    const request = "/v1/mytrades";
    const body = { request, symbol, limit_trades, ...rest };
    return this.post<PastTrade[]>(request, {}, body);
  }

  /** Get the volume in price currency that has been traded across all pairs over a period of 30 days. */
  public getNotionalVolume(account?: AccountName): Promise<NotionalVolume> {
    const request = "/v1/notionalvolume";
    const body = { request, ...account };
    return this.post<NotionalVolume>(request, {}, body);
  }

  /** Get the trade volume for each symbol. */
  public getTradeVolume(account?: AccountName): Promise<TradeVolume[][]> {
    const request = "/v1/tradevolume";
    const body = { request, ...account };
    return this.post<TradeVolume[][]>(request, {}, body);
  }

  /** Submit a new clearing order. */
  public newClearingOrder({
    symbol = this.symbol,
    ...rest
  }: ClearingOrderOptions): Promise<NewClearingOrderResponse> {
    const request = "/v1/clearing/new";
    const body = { request, symbol, ...rest };
    return this.post<NewClearingOrderResponse>(request, {}, body);
  }

  /** Submit a new broker clearing order. */
  public newBrokerOrder({
    symbol = this.symbol,
    ...rest
  }: BrokerOrderOptions): Promise<NewClearingOrderResponse> {
    const request = "/v1/clearing/broker/new";
    const body = { request, symbol, ...rest };
    return this.post<NewClearingOrderResponse>(request, {}, body);
  }

  /** Get a clearing order status. */
  public getClearingOrderStatus(
    order: ClearingOrderID
  ): Promise<ClearingOrderStatus> {
    const request = "/v1/clearing/status";
    const body = { request, ...order };
    return this.post<ClearingOrderStatus>(request, {}, body);
  }

  /** Cancel a clearing order. */
  public cancelClearingOrder(
    order: ClearingOrderID
  ): Promise<CancelClearingOrderResponse> {
    const request = "/v1/clearing/cancel";
    const body = { request, ...order };
    return this.post<CancelClearingOrderResponse>(request, {}, body);
  }

  /** Confirm a clearing order. */
  public confirmClearingOrder({
    symbol = this.symbol,
    ...rest
  }: ConfirmClearingOptions): Promise<ConfirmClearingOptionsResponse> {
    const request = "/v1/clearing/confirm";
    const body = { request, symbol, ...rest };
    return this.post<ConfirmClearingOptionsResponse>(request, {}, body);
  }

  /** Get the available balances in the supported currencies. */
  public getAvailableBalances(account?: AccountName): Promise<Balance[]> {
    const request = "/v1/balances";
    const body = { request, ...account };
    return this.post<Balance[]>(request, {}, body);
  }

  /** Get the available balances in the supported currencies as well as in notional USD. */
  public getNotionalBalances({
    currency = DefaultCurrency,
    ...account
  }: NotionalBalancesOptions = {}): Promise<NotionalBalance[]> {
    const request = `/v1/notionalbalances/${currency}`;
    const body = { request, ...account };
    return this.post<NotionalBalance[]>(request, {}, body);
  }

  /** Get deposits and withdrawals in the supported currencies. */
  public getTransfers(rest?: TransferFilter): Promise<Transfer[]> {
    const request = "/v1/transfers";
    const body = { request, ...rest };
    return this.post<Transfer[]>(request, {}, body);
  }

  /** Get deposit addresses. */
  public getDepositAddresses({
    network,
    ...rest
  }: DepositAddressesFilter): Promise<DepositAddress[]> {
    const request = `/v1/addresses/${network}`;
    const body = { request, ...rest };
    return this.post<DepositAddress[]>(request, {}, body);
  }

  /** Get a new deposit address. */
  public getNewAddress({
    currency,
    ...rest
  }: NewAddressFilter): Promise<NewAddress> {
    const request = `/v1/deposit/${currency}/newAddress`;
    const body = { request, ...rest };
    return this.post<NewAddress>(request, {}, body);
  }

  /** Withdraw cryptocurrency funds to a whitelisted address. */
  public withdrawCrypto({
    currency,
    ...rest
  }: WithdrawCryptoFilter): Promise<Withdrawal> {
    const request = `/v1/withdraw/${currency}`;
    const body = { request, ...rest };
    return this.post<Withdrawal>(request, {}, body);
  }

  /** Make an internal transfer between any two exchange accounts within the Group. */
  public internalTransfer({
    currency,
    ...rest
  }: InternalTransferFilter): Promise<InternalTransferResponse> {
    const request = `/v1/account/transfer/${currency}`;
    const body = { request, ...rest };
    return this.post<InternalTransferResponse>(request, {}, body);
  }

  /** The add bank API allows for banking information to be sent in via API. However, for the bank to be verified, you must still send in a wire for any amount from the bank account. */
  public addBank(bank: AddBankOptions): Promise<AddBankResponse> {
    const request = `/v1/payments/addbank`;
    const body = { request, ...bank };
    return this.post<AddBankResponse>(request, {}, body);
  }

  /** Get data on balances in the account and linked banks */
  public getPaymentMethods(account?: AccountName): Promise<PaymentMethods> {
    const request = `/v1/payments/methods`;
    const body = { request, ...account };
    return this.post<PaymentMethods>(request, {}, body);
  }

  /** Get details about the specific account requested such as users, country codes, etc. */
  public getAccountDetails(account?: AccountName): Promise<AccountDetails> {
    const request = "/v1/account";
    const body = { request, ...account };
    return this.post<AccountDetails>(request, {}, body);
  }

  /** Create a new exchange account within the group. */
  public createAccount(account: Account): Promise<Account> {
    const request = "/v1/account/create";
    const body = { request, ...account };
    return this.post<Account>(request, {}, body);
  }

  /** Get the accounts within the group. */
  public getAccounts(): Promise<AccountInfo[]> {
    const request = "/v1/account/list";
    return this.post<AccountInfo[]>(request, {}, { request });
  }

  /** Withdraw `USD` as `GUSD`. */
  public withdrawGUSD(options: WithdrawGUSDFilter): Promise<GUSDWithdrawal> {
    const request = "/v1/withdraw/usd";
    const body = { request, ...options };
    return this.post<GUSDWithdrawal>(request, {}, body);
  }

  /** Prevent a session from timing out and canceling orders if the require heartbeat flag has been set. */
  public heartbeat(): Promise<Heartbeat> {
    const request = "/v1/heartbeat";
    return this.post<Heartbeat>(request, {}, { request });
  }

  public set nonce(nonce: () => number) {
    this.#nonce = nonce;
  }

  public get nonce(): () => number {
    return this.#nonce;
  }
}
