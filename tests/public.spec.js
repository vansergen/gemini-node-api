const assert = require('assert');

const { PublicClient } = require('../index.js');
const publicClient = new PublicClient();
const {
  EXCHANGE_API_URL,
  SANDBOX_API_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_SYMBOL,
} = require('../lib/utilities');

suite('PublicClient', () => {
  test('.constructor()', () => {
    assert.deepStrictEqual(publicClient.symbol, DEFAULT_SYMBOL);
    assert.deepStrictEqual(publicClient.sandbox, false);
    assert.deepStrictEqual(publicClient.api_uri, EXCHANGE_API_URL);
    assert.deepStrictEqual(publicClient.timeout, DEFAULT_TIMEOUT);
  });

  test('.constructor() (with sandbox flag)', () => {
    const newClient = new PublicClient({ sandbox: true });
    assert.deepStrictEqual(newClient.sandbox, true);
    assert.deepStrictEqual(newClient.api_uri, SANDBOX_API_URL);
  });

  test('.constructor() (with custom options)', () => {
    const sandbox = true;
    const api_uri = 'https://new-gemini-api-uri.com';
    const timeout = 9000;
    const symbol = 'zecbtc';
    const newClient = new PublicClient({ sandbox, api_uri, timeout, symbol });
    assert.deepStrictEqual(newClient.sandbox, sandbox);
    assert.deepStrictEqual(newClient.api_uri, api_uri);
    assert.deepStrictEqual(newClient.timeout, timeout);
    assert.deepStrictEqual(newClient.symbol, symbol);
  });
});
