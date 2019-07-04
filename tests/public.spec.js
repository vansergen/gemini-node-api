const assert = require('assert');
const nock = require('nock');

const { PublicClient } = require('../index.js');
const publicClient = new PublicClient();
const {
  EXCHANGE_API_URL,
  SANDBOX_API_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_SYMBOL,
} = require('../lib/utilities');

suite('PublicClient', () => {
  teardown(() => nock.cleanAll());

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

  suite('.request()', () => {
    test('process 2xx response', done => {
      const symbol = 'btcusd';
      const uri = 'v1/pubticker/' + symbol;
      const response = {
        ask: '977.59',
        bid: '977.35',
        last: '977.65',
        volume: {
          BTC: '2210.505328803',
          USD: '2135477.463379586263',
          timestamp: 1483018200000,
        },
      };
      nock(EXCHANGE_API_URL)
        .get('/' + uri)
        .times(1)
        .reply(200, response);

      publicClient
        .request({ uri })
        .then(data => {
          assert.deepStrictEqual(data, response);
          done();
        })
        .catch(error => assert.fail(error));
    });

    test('handles 3xx response', done => {
      const uri = 'v1/symbols';
      const response = { error: 'some error' };
      nock(EXCHANGE_API_URL)
        .get('/' + uri)
        .times(1)
        .reply(302, response);

      publicClient
        .request({ uri })
        .then(() => assert.fail('Should have thrown an error'))
        .catch(error => {
          assert.deepStrictEqual(error.message, '302 - {"error":"some error"}');
          assert.deepStrictEqual(error.statusCode, 302);
          assert.deepStrictEqual(error.error, response);
          done();
        });
    });

    test('handles 4xx response', done => {
      const uri = 'v1/symbols';
      const response = { error: 'some error' };
      nock(EXCHANGE_API_URL)
        .get('/' + uri)
        .times(1)
        .reply(400, response);

      publicClient
        .request({ uri })
        .then(() => assert.fail('Should have thrown an error'))
        .catch(error => {
          assert.deepStrictEqual(error.message, '400 - {"error":"some error"}');
          assert.deepStrictEqual(error.statusCode, 400);
          assert.deepStrictEqual(error.error, response);
          done();
        });
    });

    test('handles 5xx response', done => {
      const uri = 'v1/symbols';
      const response = { error: 'some error' };
      nock(EXCHANGE_API_URL)
        .get('/' + uri)
        .times(1)
        .reply(504, response);

      publicClient
        .request({ uri })
        .then(() => assert.fail('Should have thrown an error'))
        .catch(error => {
          assert.deepStrictEqual(error.message, '504 - {"error":"some error"}');
          assert.deepStrictEqual(error.statusCode, 504);
          assert.deepStrictEqual(error.error, response);
          done();
        });
    });
  });

  test('.get()', done => {
    const symbol = 'btcusd';
    const uri = 'v1/auction/' + symbol;
    const response = {
      closed_until_ms: 1474567602895,
      last_auction_price: '629.92',
      last_auction_quantity: '430.12917506',
      last_highest_bid_price: '630.10',
      last_lowest_ask_price: '632.44',
      last_collar_price: '631.27',
      next_auction_ms: 1474567782895,
    };
    nock(EXCHANGE_API_URL)
      .get('/' + uri)
      .times(1)
      .reply(200, response);

    publicClient
      .get({ uri })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.getSymbols()', done => {
    const uri = '/v1/symbols';
    const response = [
      'btcusd',
      'ethbtc',
      'ethusd',
      'bchusd',
      'bchbtc',
      'bcheth',
      'ltcusd',
      'ltcbtc',
      'ltceth',
      'ltcbch',
      'zecusd',
      'zecbtc',
      'zeceth',
      'zecbch',
      'zecltc',
    ];
    nock(EXCHANGE_API_URL)
      .get(uri)
      .times(1)
      .reply(200, response);

    publicClient
      .getSymbols()
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });
});
