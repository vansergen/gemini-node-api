const request = require('request-promise');
const Promise = require('bluebird');
const {
  API_LIMIT,
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
   * @param {Object} options={}
   * @param {string} options.uri
   * @param {Object} [options.qs={}] - An optional query.
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
  get({ qs = {}, uri } = {}) {
    this._requireProperties(uri);

    return this.request({ method: 'GET', uri, qs: this._removeUndefined(qs) });
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

  /**
   * @example
   * const symbols = await publicClient.getSymbols();
   * @description Get all available symbols for trading.
   * @see {@link https://docs.gemini.com/rest-api/#symbols|symbols}
   */
  getSymbols() {
    return this.get({ uri: 'v1/symbols' });
  }

  /**
   * @param {Object} [options]
   * @param {string} [options.symbol] - Trading symbol.
   * @example
   * const ticker = await publicClient.getTicker();
   * @description Get information about recent trading activity for the symbol.
   * @see {@link https://docs.gemini.com/rest-api/#ticker|ticker}
   */
  getTicker({ symbol = this.symbol } = {}) {
    return this.get({ uri: 'v1/pubticker/' + symbol });
  }

  /**
   * @param {Object} [options]
   * @param {string} [options.symbol] - Trading symbol.
   * @param {number} [options.limit_bids=0] - Limit the number of bids (offers to buy) returned.
   * @param {number} [options.limit_asks=0] - Limit the number of asks (offers to sell) returned.
   * @example
   * const book = await publicClient.getOrderBook();
   * @description Get the current order book.
   * @see {@link https://docs.gemini.com/rest-api/#current-order-book|current-order-book}
   */
  getOrderBook({ symbol = this.symbol, limit_bids = 0, limit_asks = 0 } = {}) {
    return this.get({
      uri: 'v1/book/' + symbol,
      qs: { limit_bids, limit_asks },
    });
  }

  /**
   * @param {Object} [options]
   * @param {string} [options.symbol] - Trading symbol.
   * @param {number} [options.since] - Only return trades after this timestamp.
   * @param {number} [options.limit_trades] - The maximum number of trades to return.
   * @param {boolean} [options.include_breaks] - Whether to display broken trades.
   * @example
   * const trades = await publicClient.getTradeHistory();
   * @description Get the trades that have executed since the specified timestamp.
   * @see {@link https://docs.gemini.com/rest-api/#trade-history|trade-history}
   */
  getTradeHistory({
    symbol = this.symbol,
    since,
    limit_trades = API_LIMIT,
    include_breaks,
  } = {}) {
    return this.get({
      uri: 'v1/trades/' + symbol,
      qs: { since, limit_trades, include_breaks },
    });
  }

  /**
   * @param {Object} [options]
   * @param {string} [options.symbol] - Trading symbol.
   * @example
   * const auction = await publicClient.getCurrentAuction();
   * @description Get current auction information.
   * @see {@link https://docs.gemini.com/rest-api/#current-auction|current-auction}
   */
  getCurrentAuction({ symbol = this.symbol } = {}) {
    return this.get({ uri: 'v1/auction/' + symbol });
  }

  /**
   * @private
   * @param {...*} [properties]
   * @example
   * const { a, b, c } = { a: 0, b: 0 };
   * this._requireProperties(a, b, c);
   * @throws Will throw an error if one of the `properties` is undefined.
   */
  _requireProperties(...properties) {
    for (let property of properties) {
      if (property === undefined) {
        throw new Error('`options` is missing a required property`');
      }
    }
  }

  /**
   * @private
   * @param {...*} [properties]
   * @example
   * const obj = { a: undefined, b: undefined, c: 0, d: false };
   * const newObj = this._removeUndefined(obj);
   * @throws Will throw an error if one of the `properties` is undefined.
   */
  _removeUndefined(object) {
    let newObject = {};
    for (let key of Object.keys(object)) {
      if (object[key] !== undefined) {
        newObject[key] = object[key];
      }
    }
    return newObject;
  }
}

module.exports = PublicClient;
