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

  export type RequestResponse = JSONObject | JSONObject[] | string[];

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
  }
}
