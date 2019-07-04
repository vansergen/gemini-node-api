const assert = require('assert');
const nock = require('nock');

const { AuthenticatedClient } = require('../index.js');

const key = 'Gemini-API-KEY';
const secret = 'Gemini-API-SECRET';

suite('AuthenticatedClient', () => {
  teardown(() => nock.cleanAll());

  test('.constructor() (throws error with incomplete credentials)', done => {
    try {
      new AuthenticatedClient({ key });
    } catch (error) {
      if (error.message === '`options` is missing a required property`') {
        done();
      }
    }
    assert.fail();
  });

  test('.constructor() (passes options to PublicClient)', () => {
    const sandbox = true;
    const api_uri = 'https://new-gemini-api-uri.com';
    const timeout = 9000;
    const symbol = 'zecbtc';
    const client = new AuthenticatedClient({
      sandbox,
      api_uri,
      timeout,
      symbol,
      key,
      secret,
    });
    assert.deepStrictEqual(client.symbol, symbol);
    assert.deepStrictEqual(client.sandbox, sandbox);
    assert.deepStrictEqual(client.api_uri, api_uri);
    assert.deepStrictEqual(client.timeout, timeout);
    assert.deepStrictEqual(client.key, key);
    assert.deepStrictEqual(client.secret, secret);
  });
});
