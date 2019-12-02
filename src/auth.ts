import { RPCOptions } from "rpc-bluebird";
import { RequestPromise as Promise } from "request-promise";
import { PublicClient, PublicClientOptions, Headers } from "./public";
import { SignRequest } from "./signer";

export type AccountName = { account?: string };

export type TransferFilter = AccountName & {
  timestamp?: number;
  limit_transfers?: number;
};

export type Account = { name: string; type?: "exchange" | "custody" };

export type WithdrawGUSDFilter = AccountName & {
  address: string;
  amount: string;
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
