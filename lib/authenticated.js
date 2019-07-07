const PublicClient = require('./public.js');
const SignRequest = require('./signer.js');
const { API_LIMIT } = require('./utilities.js');

class AuthenticatedClient extends PublicClient {
  /**
   * @param {Object} options
   * @param {string} options.key - Gemini API key.
   * @param {string} options.secret - Gemini API secret.
   * @param {string} [options.symbol] - If `symbol` is provided then it will be used in all future requests that require `symbol` but it is omitted (not applied to requests where `symbol` is optional).
   * @param {boolean} [options.sandbox] - If set to `true` AuthenticatedClient will use the sandbox endpoints.
   * @param {string} [options.api_uri] - Overrides the default apiuri, if provided.
   * @param {number} [options.timeout] - Overrides the default timeout, if provided.
   * @example
   * const { AuthenticatedClient } = require('gemini-node-api');
   * const key = 'Gemini-api-key';
   * const secret = 'Gemini-api-secret';
   * const authClient = new AuthenticatedClient({ key, secret });
   * @throws Will throw an error if incomplete credentials are provided.
   * @description Create AuthenticatedClient.
   */
  constructor({ key, secret, ...other }) {
    super(other);
    this._requireProperties(key, secret);

    this.key = key;
    this.secret = secret;
  }

  /**
   * @param {Object} options={}
   * @param {string} options.request
   * @example
   * authClient
   *   .post({ request: '/v1/deposit/btc/newAddress' })
   *   .then(data => {
   *     console.log(data);
   *   })
   *   .catch(error => {
   *     console.error(error);
   *   });
   * @throws Will throw an error if `options.request` is undefined.
   * @description Make `POST` request.
   */
  post(options = {}) {
    this._requireProperties(options.request);

    options.nonce = this._nonce();
    return this.request({
      method: 'POST',
      uri: options.request,
      headers: SignRequest({ key: this.key, secret: this.secret }, options),
    });
  }

  /**
   * @param {Object} options={}
   * @param {string} [options.symbol] - The symbol for the new order.
   * @param {string} [options.client_order_id] - A client-specified order id.
   * @param {number} options.amount - Quoted decimal amount to purchase.
   * @param {number} [options.min_amount] - Minimum decimal amount to purchase, for block trades only.
   * @param {number} options.price - Quoted decimal amount to spend per unit.
   * @param {string} options.side - `buy` or `sell`.
   * @param {boolean} [options.moc] - `maker-or-cancel` flag.
   * @param {boolean} [options.ioc] - `immediate-or-cancel` flag.
   * @param {boolean} [options.fok] - `fill-or-kill` flag.
   * @param {boolean} [options.ao] - `auction-only` flag.
   * @param {boolean} [options.ioi] - `indication-of-interest` flag.
   * @example
   * const order = await authClient.newOrder({
   *   symbol: 'zecltc',
   *   client_order_id: 'd0c5340b-6d6c-49d9-b567-48c4bfca13d2',
   *   amount: 1,
   *   price: 0.9,
   *   side: 'buy',
   *   moc: true,
   *   ioc: false,
   *   fok: false,
   *   ao: false,
   *   ioi: false,
   * });
   * @throws Will throw an error if `options.amount`, `options.price` or `options.side` are undefined.
   * @description Submit a new order.
   * @see {@link https://docs.gemini.com/rest-api/#new-order|new-order}
   */
  newOrder({
    symbol = this.symbol,
    client_order_id,
    amount,
    min_amount,
    price,
    side,
    moc,
    ioc,
    fok,
    ao,
    ioi,
  } = {}) {
    this._requireProperties(amount, price, side);

    const options = [];
    if (moc) {
      options.push('maker-or-cancel');
    } else if (ioc) {
      options.push('immediate-or-cancel');
    } else if (fok) {
      options.push('fill-or-kill');
    } else if (ao) {
      options.push('auction-only');
    } else if (ioi) {
      options.push('indication-of-interest');
    }
    return this.post({
      request: '/v1/order/new',
      client_order_id,
      symbol,
      amount,
      min_amount,
      price,
      side,
      type: 'exchange limit',
      options,
    });
  }

  /**
   * @description Submit buy order.
   * @param {{...*}} [options] - The same parameters as in `newOrder`.
   */
  buy({ ...options } = {}) {
    return this.newOrder({ ...options, side: 'buy' });
  }

  /**
   * @description Submit sell order.
   * @param {{...*}} [options] - The same parameters as in `newOrder`.
   */
  sell({ ...options } = {}) {
    return this.newOrder({ ...options, side: 'sell' });
  }

  /**
   * @param {Object} options={}
   * @param {number} options.order_id - The order ID.
   * @example
   * const order_id = 106817811;
   * const order = await authClient.cancelOrder({ order_id });
   * @throws Will throw an error if `options.order_id` is undefined.
   * @description Cancel order by `order_id`.
   * @see {@link https://docs.gemini.com/rest-api/#cancel-order|cancel-order}
   */
  cancelOrder({ order_id } = {}) {
    this._requireProperties(order_id);

    return this.post({ request: '/v1/order/cancel', order_id });
  }

  /**
   * @example
   * const result = await authClient.cancelSession();
   * @description Cancel all orders opened by this API key.
   * @see {@link https://docs.gemini.com/rest-api/#cancel-all-session-orders|cancel-all-session-orders}
   */
  cancelSession() {
    return this.post({ request: '/v1/order/cancel/session' });
  }

  /**
   * @example
   * const result = await authClient.cancelAll();
   * @description Cancel all active orders.
   * @see {@link https://docs.gemini.com/rest-api/#cancel-all-active-orders|cancel-all-active-orders}
   */
  cancelAll() {
    return this.post({ request: '/v1/order/cancel/all' });
  }

  /**
   * @param {Object} options={}
   * @param {number} options.order_id - The order ID to be queried.
   * @example
   * const order_id = 106817811;
   * const order = await authClient.getOrderStatus({ order_id });
   * @throws Will throw an error if `options.order_id` is undefined.
   * @description Get order status.
   * @see {@link https://docs.gemini.com/rest-api/#order-status|order-status}
   */
  getOrderStatus({ order_id } = {}) {
    this._requireProperties(order_id);

    return this.post({ request: '/v1/order/status', order_id });
  }

  /**
   * @example
   * const orders = await authClient.getActiveOrders();
   * @description Get all your live orders.
   * @see {@link https://docs.gemini.com/rest-api/#get-active-orders|get-active-orders}
   */
  getActiveOrders() {
    return this.post({ request: '/v1/orders' });
  }

  /**
   * @param {Object} [options={}]
   * @param {string} [options.symbol] - The symbol to retrieve trades for.
   * @param {number} [options.limit_trades] - The maximum number of trades to return.
   * @param {number} [options.timestamp] - Only return trades on or after this timestamp.
   * @example
   * const trades = await authClient.getPastTrades();
   * @description Get your past trades.
   * @see {@link https://docs.gemini.com/rest-api/#get-past-trades|get-past-trades}
   */
  getPastTrades({
    symbol = this.symbol,
    limit_trades = API_LIMIT,
    timestamp,
  } = {}) {
    return this.post({
      request: '/v1/mytrades',
      symbol,
      limit_trades,
      timestamp,
    });
  }

  /**
   * @example
   * const volume = await authClient.getNotionalVolume();
   * @description Get the volume in price currency that has been traded across all pairs over a period of 30 days.
   * @see {@link https://docs.gemini.com/rest-api/#get-notional-volume|get-notional-volume}
   */
  getNotionalVolume() {
    return this.post({ request: '/v1/notionalvolume' });
  }

  /**
   * @example
   * const volume = await authClient.getTradeVolume();
   * @description Get trade volume for each symbol.
   * @see {@link https://docs.gemini.com/rest-api/#get-trade-volume|get-trade-volume}
   */
  getTradeVolume() {
    return this.post({ request: '/v1/tradevolume' });
  }

  /**
   * @example
   * const balances = await authClient.getAvailableBalances();
   * @description Get available balances.
   * @see {@link https://docs.gemini.com/rest-api/#get-available-balances|get-available-balances}
   */
  getAvailableBalances() {
    return this.post({ request: '/v1/balances' });
  }

  /**
   * @param {Object} [options={}]
   * @param {number} [options.timestamp] - Only return transfers on or after this timestamp.
   * @param {number} [options.limit_transfers=50] - The maximum number of transfers to return.
   * @example
   * const transfers = await authClient.getTransfers();
   * @description Get deposits and withdrawals.
   * @see {@link https://docs.gemini.com/rest-api/#transfers|transfers}
   */
  getTransfers({ timestamp, limit_transfers = 50 } = {}) {
    return this.post({ request: '/v1/transfers', timestamp, limit_transfers });
  }

  /**
   * @param {Object} options={}
   * @param {string} options.currency - Three-letter currency code of a supported crypto-currency, e.g. `btc` or `eth`.
   * @param {string} [options.label] - Label for the deposit address.
   * @param {boolean} [options.legacy] - Whether to generate a legacy P2SH-P2PKH litecoin address.
   * @example
   * const address = await authClient.getNewAddress({ currency: 'btc' });
   * @throws Will throw an error if `options.currency` is undefined.
   * @description Get new deposit address.
   * @see {@link https://docs.gemini.com/rest-api/#new-deposit-address|new-deposit-address}
   */
  getNewAddress({ currency, label, legacy } = {}) {
    this._requireProperties(currency);

    const request = '/v1/deposit/' + currency + '/newAddress';
    return this.post({ request, label, legacy });
  }

  /**
   * @param {Object} options={}
   * @param {string} options.currency - Three-letter currency code of a supported crypto-currency, e.g. `btc` or `eth`.
   * @param {string} options.address - Standard string format of a whitelisted cryptocurrency address.
   * @param {number} options.amount - Quoted decimal amount to withdraw.
   * @example
   * const currency = 'btc';
   * const address = '1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen';
   * const amount = 1;
   * const withdrawal = await authClient.withdrawCrypto({
   *   currency,
   *   address,
   *   amount,
   * });
   * @throws Will throw an error if `options.currency`, `options.address` or `options.amount` are undefined.
   * @description Withdraw cryptocurrency funds to a whitelisted address.
   * @see {@link https://docs.gemini.com/rest-api/#withdraw-crypto-funds-to-whitelisted-address|withdraw-crypto-funds-to-whitelisted-address}
   */
  withdrawCrypto({ currency, address, amount } = {}) {
    this._requireProperties(currency, address, amount);

    return this.post({ request: '/v1/withdraw/' + currency, address, amount });
  }

  /**
   * @param {Object} options={}
   * @param {string} options.address - Standard string format of a whitelisted GUSD address.
   * @param {number} options.amount - Quoted decimal amount to withdraw.
   * @example
   * const address = '0x943a6C7e15FEc0555528266a44D573a6E1A21DBD';
   * const amount = 50000;
   * const withdrawal = await authClient.withdrawGUSD({ address, amount });
   * @throws Will throw an error if `options.address` or `options.amount` are undefined.
   * @description Withdraw `USD` as `GUSD`.
   * @see {@link https://docs.gemini.com/rest-api/#withdraw-usd-as-gusd|withdraw-usd-as-gusd}
   */
  withdrawGUSD({ address, amount } = {}) {
    this._requireProperties(address, amount);

    return this.post({ request: '/v1/withdraw/usd', address, amount });
  }

  /**
   * @example
   * const heartbeat = await authClient.heartbeat();
   * @description Prevent a session from timing out and canceling orders if the require heartbeat flag has been set.
   * @see {@link https://docs.gemini.com/rest-api/#heartbeat|heartbeat}
   */
  heartbeat() {
    return this.post({ request: '/v1/heartbeat' });
  }

  /**
   * @private
   * @example
   * const nonce = authClient._nonce();
   * @description Get new nonce.
   */
  _nonce() {
    if (typeof this.nonce === 'function') {
      return this.nonce();
    }
    return !this.nonce ? (this.nonce = Date.now()) : ++this.nonce;
  }
}

module.exports = AuthenticatedClient;
