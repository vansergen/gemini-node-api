const EXCHANGE_WS_URL = "wss://api.gemini.com";
const SANDBOX_WS_URL = "wss://api.sandbox.gemini.com";

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
  for (const key of Object.keys(options)) {
    if (options[key] === undefined) {
      if (remove) {
        delete options[key];
      } else {
        throw new Error(
          "`options` is missing a required property: `" + key + "`"
        );
      }
    }
  }
};

module.exports = { EXCHANGE_WS_URL, SANDBOX_WS_URL, _checkUndefined };
