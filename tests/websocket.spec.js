const assert = require('assert');

const { WebsocketClient } = require('../index.js');

const {
  EXCHANGE_WS_URL,
  DEFAULT_SYMBOL,
  SANDBOX_WS_URL,
} = require('../lib/utilities.js');

const key = 'Gemini-API-key';
const secret = 'Gemini-API-secret';
const symbol = 'zecbtc';

suite('WebsocketClient', () => {
  test('.constructor()', () => {
    const client = new WebsocketClient();
    assert.deepStrictEqual(client.api_uri, EXCHANGE_WS_URL);
    assert.deepStrictEqual(client.symbol, DEFAULT_SYMBOL);
    assert.deepStrictEqual(client.key, undefined);
    assert.deepStrictEqual(client.secret, undefined);
  });

  test('.constructor() (with sandbox flag)', () => {
    const sandbox = true;
    const client = new WebsocketClient({ sandbox, symbol, key, secret });
    assert.deepStrictEqual(client.api_uri, SANDBOX_WS_URL);
    assert.deepStrictEqual(client.symbol, symbol);
    assert.deepStrictEqual(client.key, key);
    assert.deepStrictEqual(client.secret, secret);
  });
});
