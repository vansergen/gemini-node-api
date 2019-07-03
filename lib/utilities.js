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

module.exports = {
  DEFAULT_SYMBOL,
  DEFAULT_TIMEOUT,
  EXCHANGE_API_URL,
  SANDBOX_API_URL,
  HEADERS,
};
