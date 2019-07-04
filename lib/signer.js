const crypto = require('crypto');

const SignRequest = (auth, options = {}) => {
  const payload = Buffer.from(JSON.stringify(options)).toString('base64');
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
