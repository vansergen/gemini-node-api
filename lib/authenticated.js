const PublicClient = require('./public.js');
const SignRequest = require('./signer.js');

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
