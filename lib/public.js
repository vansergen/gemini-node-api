const request = require("request-promise");
const Promise = require("bluebird");
const {
  API_LIMIT,
  DEFAULT_SYMBOL,
  DEFAULT_TIMEOUT,
  EXCHANGE_API_URL,
  SANDBOX_API_URL,
  HEADERS,
  _checkUndefined
} = require("./utilities.js");

/**
 * @callback Callback
 * @param error
 * @param data
 */

class PublicClient {
  /**
   * @param {Object} options={}
   * @param {string} options.uri
   * @param {...*} [options.qs] - An optional query.
   * @example
   * publicClient
   *   .get({ uri: 'v1/symbols' })
   *   .then(data => {
   *     console.log(data);
   *   })
   *   .catch(error => {
   *     console.error(error);
   *   });
   * @throws Will throw an error if `options.uri` is undefined.
   * @description Make `GET` request.
   */
  get({ uri, ...qs } = {}) {
    _checkUndefined({ uri });
    _checkUndefined(qs, true);

    return this.request({ method: "GET", uri, qs });
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
        .then(data => resolve(data))
        .catch(error => reject(error.error || error));
    });
  }

  /**
   * @param {Object} [options={}]
   * @param {string} [options.symbol] - Trading symbol.
   * @param {number} [options.since] - Only return trades after this timestamp.
   * @param {number} [options.limit_auction_results] - The maximum number of auction events to return.
   * @param {boolean} [options.include_indicative] - Whether to include publication of indicative prices and quantities.
   * @example
   * const history = await publicClient.getAuctionHistory();
   * @description Get the auction events.
   * @see {@link https://docs.gemini.com/rest-api/#auction-history|auction-history}
   */
  getAuctionHistory({
    symbol = this.symbol,
    since,
    limit_auction_results = API_LIMIT,
    include_indicative
  } = {}) {
    return this.get({
      uri: "v1/auction/" + symbol + "/history",
      since,
      limit_auction_results,
      include_indicative
    });
  }
}

module.exports = PublicClient;
