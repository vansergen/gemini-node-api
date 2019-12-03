const PublicClient = require("./public.js");
const SignRequest = require("./signer.js");
const { API_LIMIT, _checkUndefined } = require("./utilities.js");

class AuthenticatedClient extends PublicClient {
  /**
   * @extends PublicClient
   * @param {Object} options
   * @param {string} options.key - Gemini API key.
   * @param {string} options.secret - Gemini API secret.
   * @param {...*} [options.other] - Other parameters supported by `PublicClient`.
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
    _checkUndefined({ key, secret });

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
    const { request } = options;
    _checkUndefined({ request });

    options.nonce = this._nonce();
    return this.request({
      method: "POST",
      uri: request,
      headers: SignRequest({ key: this.key, secret: this.secret }, options)
    });
  }

  /**
   * @example
   * const volume = await authClient.getNotionalVolume();
   * @description Get the volume in price currency that has been traded across all pairs over a period of 30 days.
   * @see {@link https://docs.gemini.com/rest-api/#get-notional-volume|get-notional-volume}
   */
  getNotionalVolume() {
    return this.post({ request: "/v1/notionalvolume" });
  }

  /**
   * @example
   * const volume = await authClient.getTradeVolume();
   * @description Get trade volume for each symbol.
   * @see {@link https://docs.gemini.com/rest-api/#get-trade-volume|get-trade-volume}
   */
  getTradeVolume() {
    return this.post({ request: "/v1/tradevolume" });
  }

  /**
   * @param {Object} options={}
   * @param {string} [options.symbol] - The symbol for the new order.
   * @param {string} [options.counterparty_id] - An optional symbol that corresponds with a counterparty to which you are directing the trade.
   * @param {number} options.amount - Quoted decimal amount to purchase.
   * @param {number} options.expires_in_hrs - The number of hours before the trade expires. Your counterparty will need to confirm the order before this time expires.
   * @param {number} options.price - Quoted decimal amount to spend per unit.
   * @param {string} options.side - `buy` or `sell`.
   * @example
   * const order = await authClient.newClearingOrder({
   *   expires_in_hrs: 10,
   *   symbol: 'zecltc',
   *   amount: 1,
   *   price: 1,
   *   side: 'buy',
   * });
   * @throws Will throw an error if `options.amount`, `options.expires_in_hrs`, `options.price` or `options.side` are undefined.
   * @description Submit a new clearing order.
   * @see {@link https://docs.gemini.com/rest-api/#new-clearing-order|new-clearing-order}
   */
  newClearingOrder({
    symbol = this.symbol,
    amount,
    price,
    side,
    expires_in_hrs,
    counterparty_id
  } = {}) {
    _checkUndefined({ amount, price, side, expires_in_hrs });

    return this.post({
      request: "/v1/clearing/new",
      symbol,
      amount,
      price,
      side,
      expires_in_hrs,
      counterparty_id
    });
  }

  /**
   * @param {Object} options={}
   * @param {string} options.clearing_id - A unique identifier for the clearing order.
   * @example
   * const clearing_id = 'OM9VNL1G';
   * const order = await authClient.getClearingOrderStatus({ clearing_id });
   * @throws Will throw an error if `options.clearing_id` is undefined.
   * @description Get clearing order status.
   * @see {@link https://docs.gemini.com/rest-api/#clearing-order-status|clearing-order-status}
   */
  getClearingOrderStatus({ clearing_id } = {}) {
    _checkUndefined({ clearing_id });

    return this.post({ request: "/v1/clearing/status", clearing_id });
  }

  /**
   * @param {Object} options={}
   * @param {string} options.clearing_id - A unique identifier for the clearing order.
   * @example
   * const clearing_id = 'P0521QDV';
   * const order = await authClient.cancelClearingOrder({ clearing_id });
   * @throws Will throw an error if `options.clearing_id` is undefined.
   * @description Cancel clearing order by `clearing_id`.
   * @see {@link https://docs.gemini.com/rest-api/#cancel-clearing-order|cancel-clearing-order}
   */
  cancelClearingOrder({ clearing_id } = {}) {
    _checkUndefined({ clearing_id });

    return this.post({ request: "/v1/clearing/cancel", clearing_id });
  }

  /**
   * @param {Object} options={}
   * @param {string} [options.symbol] - The symbol of the order.
   * @param {string} options.clearing_id - A unique identifier for the clearing order. The `clearing_id` can be used to check the status of your order or by the counterparty to confirm the order.
   * @param {number} options.amount - Quoted decimal amount to purchase.
   * @param {number} options.price - Quoted decimal amount to spend per unit.
   * @param {string} options.side - `buy` or `sell`. Must be the opposite side of the initiator's side.
   * @example
   * const response = await authClient.confirmClearingOrder({
   *   clearing_id: 'OM9VNL1G',
   *   symbol: 'zecltc',
   *   amount: 1,
   *   price: 1,
   *   side: 'buy',
   * });
   * @throws Will throw an error if `options.amount`, `options.clearing_id`, `options.price` or `options.side` are undefined.
   * @description Confirm a clearing order.
   * @see {@link https://docs.gemini.com/rest-api/#confirm-clearing-order|confirm-clearing-order}
   */
  confirmClearingOrder({
    symbol = this.symbol,
    clearing_id,
    amount,
    price,
    side
  } = {}) {
    _checkUndefined({ clearing_id, amount, price, side });

    return this.post({
      request: "/v1/clearing/confirm",
      symbol,
      clearing_id,
      amount,
      price,
      side
    });
  }

  /**
   * @private
   * @example
   * const nonce = authClient._nonce();
   * @description Get new nonce.
   */
  _nonce() {
    if (typeof this.nonce === "function") {
      return this.nonce();
    }
    return (this.nonce = Date.now());
  }
}

module.exports = AuthenticatedClient;
