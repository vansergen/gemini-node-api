import { RPCOptions } from "rpc-bluebird";
import { RequestPromise as Promise } from "request-promise";
import { PublicClient, PublicClientOptions, Headers } from "./public";
import { SignRequest } from "./signer";

export type Account = { name: string; type?: "exchange" | "custody" };

export type AccountInfo = {
  name: string;
  account: string;
  type: "exchange" | "custody";
  counterparty_id: string;
  created: number;
};

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
