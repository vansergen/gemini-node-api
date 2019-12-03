const PublicClient = require("./public.js");
const SignRequest = require("./signer.js");
const { _checkUndefined } = require("./utilities.js");

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
