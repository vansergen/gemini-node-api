const request = require("request-promise");
const Promise = require("bluebird");
const { HEADERS, _checkUndefined } = require("./utilities.js");

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
}

module.exports = PublicClient;
