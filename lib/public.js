const {
  DEFAULT_SYMBOL,
  DEFAULT_TIMEOUT,
  EXCHANGE_API_URL,
  SANDBOX_API_URL,
} = require('./utilities');

class PublicClient {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.symbol] - If `symbol` is provided then it will be used in all future requests that require `symbol` but it is omitted (not applied to requests where `symbol` is optional).
   * @param {boolean} [options.sandbox] - If set to `true` PublicClient will use the sandbox endpoints.
   * @param {string} [options.api_uri] - Overrides the default apiuri, if provided.
   * @param {number} [options.timeout] - Overrides the default timeout, if provided.
   * @example
   * const { PublicClient } = require('gemini-node-api');
   * const publicClient = new PublicClient({ symbol: 'zecbtc' });
   * @description Create PublicClient.
   */
  constructor({ symbol, sandbox, api_uri, timeout } = {}) {
    this.symbol = symbol || DEFAULT_SYMBOL;
    this.sandbox = sandbox ? true : false;
    this.api_uri = sandbox ? SANDBOX_API_URL : EXCHANGE_API_URL;
    if (api_uri) {
      this.api_uri = api_uri;
    }
    this.timeout = timeout || DEFAULT_TIMEOUT;
  }
}

module.exports = PublicClient;
