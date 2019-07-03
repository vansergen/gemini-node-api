const request = require('request-promise');
const Promise = require('bluebird');
const {
  DEFAULT_SYMBOL,
  DEFAULT_TIMEOUT,
  EXCHANGE_API_URL,
  SANDBOX_API_URL,
  HEADERS,
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

  /**
   * @param {Object} options
   * @param {string} options.method - `POST` or `GET`.
   * @param {string} options.uri - API endpoint.
   * @param {Object} [options.headers] - Optional headers for `POST` requests.
   * @param {Object} [options.qs] - An optional query object for `GET` requests.
   * @example
   * publicClient
   *   .request({ method: 'GET', uri: 'v1/pubticker/zecbtc' })
   *   .then(data => {
   *     console.log(data);
   *   })
   *   .catch(error => {
   *     console.error(error);
   *   });
   * @description Make a request.
   */
  request(options) {
    options.json = true;
    options.timeout = this.timeout;
    options.baseUrl = this.api_uri;
    options.headers = options.headers || {};
    Object.assign(options.headers, HEADERS);
    return new Promise((resolve, reject) => {
      request(options)
        .then(data => {
          if (data.error) {
            reject(data.error);
          } else {
            resolve(data);
          }
        })
        .catch(error => reject(error));
    });
  }
}

module.exports = PublicClient;
