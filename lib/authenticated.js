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
