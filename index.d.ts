declare module 'gemini-node-api' {
  export type PublicClientOptions = {
    symbol?: string;
    sandbox?: boolean;
    api_uri?: string;
    timeout?: number;
  };

  export class PublicClient {
    constructor(options?: PublicClientOptions);
  }
}
