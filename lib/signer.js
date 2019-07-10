const crypto = require('crypto');

/**
 * @param {Object} auth
 * @param {string} auth.key - Gemini API key.
 * @param {string} auth.secret - Gemini API secret.
 * @param {Object|string} [options={}] - Object with data to sign or `base64` encoded payload.
 */
const SignRequest = (auth, options = {}) => {
  const payload =
    typeof options === 'string'
      ? options
      : Buffer.from(JSON.stringify(options)).toString('base64');
  return {
    'X-GEMINI-PAYLOAD': payload,
    'X-GEMINI-SIGNATURE': crypto
      .createHmac('sha384', auth.secret)
      .update(payload)
      .digest('hex'),
    'X-GEMINI-APIKEY': auth.key,
  };
};

module.exports = SignRequest;
