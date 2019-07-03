import * as Promise from 'bluebird';

declare module 'gemini-node-api' {
  export type JSONObject = {
    [key: string]: any;
  };

  export type RequestOptions = {
    method: 'GET' | 'POST';
    uri: string;
    headers?: JSONObject;
    qs?: JSONObject;
  };

  export type RequestResponse = JSONObject | JSONObject[];

  export type PublicClientOptions = {
    symbol?: string;
    sandbox?: boolean;
    api_uri?: string;
    timeout?: number;
  };

  export class PublicClient {
    constructor(options?: PublicClientOptions);

    request(options: RequestOptions): Promise<RequestResponse>;
  }
}
