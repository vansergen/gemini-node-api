const API_LIMIT = 500;
const DEFAULT_SYMBOL = 'btcusd';
const DEFAULT_TIMEOUT = 10000;
const EXCHANGE_API_URL = 'https://api.gemini.com';
const SANDBOX_API_URL = 'https://api.sandbox.gemini.com';

const HEADERS = {
  'User-Agent': 'gemini-node-api-client',
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Length': 0,
  'Cache-Control': 'no-cache',
};

/**
 * @private
 * @param {Object} options={}
 * @param {boolean} remove=false - If set to `true`, it will delete undefined properties.
 * @example
 * const obj = { a: undefined, b: undefined, c: 0, d: false };
 * const newObj = _checkUndefined(obj, true);
 * @throws Will throw an error if `remove` is set to `false` and one of the properties is `undefined`.
 */
const _checkUndefined = (options = {}, remove = false) => {
  for (let key of Object.keys(options)) {
    if (options[key] === undefined) {
      if (remove) {
        delete options[key];
      } else {
        throw new Error(
          '`options` is missing a required property: `' + key + '`'
        );
      }
    }
  }
};

module.exports = {
  API_LIMIT,
  DEFAULT_SYMBOL,
  DEFAULT_TIMEOUT,
  EXCHANGE_API_URL,
  SANDBOX_API_URL,
  HEADERS,
  _checkUndefined,
};
