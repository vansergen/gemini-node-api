const request = require('request-promise');
const Promise = require('bluebird');
const {
  API_LIMIT,
  DEFAULT_SYMBOL,
  DEFAULT_TIMEOUT,
  EXCHANGE_API_URL,
  SANDBOX_API_URL,
  HEADERS,
} = require('./utilities.js');

/**
 * @callback Callback
 * @param error
 * @param data
 */

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
    this._checkUndefined({ uri });

    const method = 'GET';
    return this.request({ method, uri, qs: this._checkUndefined(qs, true) });
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
   * @param {Object} options
   * @param {string} options._method - Class method to call.
   * @param {...*} options.methodOptions
   * @param {Callback} callback
   * @example
   * const callback = (error, data) => {
   *   if (error) {
   *     console.error(error);
   *   } else {
   *     console.info(data);
   *   }
   * };
   * publicClient.cb({ _method: 'getTicker', symbol: 'zecbtc' }, callback);
   * @description Make a callback-style request.
   */
  cb({ _method, ...methodOptions }, callback) {
    try {
      this._checkUndefined({ _method });

      this[_method].call(this, methodOptions).then(data => {
        callback(null, data);
      });
    } catch (error) {
      callback(error);
    }
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
    return this.get({ uri: 'v1/book/' + symbol, limit_bids, limit_asks });
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
      since,
      limit_trades,
      include_breaks,
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
   * @param {Object} [options]
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
    include_indicative,
  } = {}) {
    return this.get({
      uri: 'v1/auction/' + symbol + '/history',
      since,
      limit_auction_results,
      include_indicative,
    });
  }

  /**
   * @private
   * @param {Object} options={}
   * @param {boolean} remove=false - Will remove undefined properties, if set to `true`.
   * @example
   * const obj = { a: undefined, b: undefined, c: 0, d: false };
   * const newObj = this._checkUndefined(obj, true);
   * @throws Will throw an error if `remove` is set to `false` and one of the properties is `undefined`.
   */
  _checkUndefined(options = {}, remove = false) {
    let newObject = {};
    for (let key of Object.keys(options)) {
      if (options[key] !== undefined) {
        newObject[key] = options[key];
      } else if (!remove) {
        throw new Error(
          '`options` is missing a required property: `' + key + '`'
        );
      }
    }
    return newObject;
  }
}

module.exports = PublicClient;
