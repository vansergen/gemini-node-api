import { RPC } from "rpc-bluebird";

export const ApiLimit = 500;
export const DefaultSymbol = "btcusd";
export const DefaulTimeout = 30000;
export const ApiUri = "https://api.gemini.com";
export const SandboxApiUri = "https://api.sandbox.gemini.com";
export const Headers = {
  "User-Agent": "gemini-node-api-client",
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Requested-With": "XMLHttpRequest",
  "Content-Length": 0,
  "Cache-Control": "no-cache"
};

export type PublicClientOptions = {
  symbol?: string;
  sandbox?: boolean;
  apiUri?: string;
  timeout?: number;
};

export class PublicClient extends RPC {
  symbol: string;

  constructor({
    symbol = DefaultSymbol,
    sandbox = false,
    apiUri = sandbox ? ApiUri : SandboxApiUri,
    timeout = DefaulTimeout
  }: PublicClientOptions = {}) {
    super({ json: true, timeout, baseUrl: apiUri, headers: Headers });
    this.symbol = symbol;
  }
}
