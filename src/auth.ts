import { RPCOptions } from "rpc-bluebird";
import { RequestPromise as Promise } from "request-promise";
import { PublicClient, PublicClientOptions, Headers } from "./public";
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
  symbol?: string;
  amount: number;
  min_amount?: number;
  price: number;
  type: "exchange limit" | "exchange stop limit";
  options?: [OrderEexecutionOptions];
  stop_price?: number;
};

export type OrderOptions = BasicOrderOptions & { side: "buy" | "sell" };

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
