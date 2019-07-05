const assert = require('assert');
const nock = require('nock');
const Promise = require('bluebird');

const { AuthenticatedClient, SignRequest } = require('../index.js');
const { EXCHANGE_API_URL } = require('../lib/utilities');

const key = 'Gemini-API-KEY';
const secret = 'Gemini-API-SECRET';
const auth = { key, secret };

const authClient = new AuthenticatedClient(auth);

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

  test('.post()', done => {
    const response = {
      currency: 'BTC',
      address: '1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen',
    };
    const request = '/v1/deposit/btc/newAddress';
    const nonce = 1560742707669;
    const payload = { request, nonce };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .post(payload)
      .then(data => {
        assert.deepEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.post() (with callback)', () => {
    const response = {
      currency: 'BTC',
      address: '1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen',
    };
    const request = '/v1/deposit/btc/newAddress';
    const nonce = 1560742707669;
    const payload = { request, nonce };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(2)
      .reply(200, response);

    const cbreq = new Promise((resolve, reject) => {
      const callback = (error, data) => {
        if (error) {
          reject(error);
        } else {
          assert.deepStrictEqual(data, response);
          resolve(data);
        }
      };
      authClient.cb('post', callback, payload);
    });

    const preq = authClient
      .post(payload)
      .then(data => {
        assert.deepStrictEqual(data, response);
      })
      .catch(error => assert.fail(error));
    return Promise.all([cbreq, preq]);
  });

  test('.getNotionalVolume()', done => {
    const response = {
      web_maker_fee_bps: 100,
      web_taker_fee_bps: 100,
      web_auction_fee_bps: 100,
      api_maker_fee_bps: 35,
      api_taker_fee_bps: 10,
      api_auction_fee_bps: 20,
      fix_maker_fee_bps: 35,
      fix_taker_fee_bps: 10,
      fix_auction_fee_bps: 20,
      block_maker_fee_bps: 50,
      block_taker_fee_bps: 0,
      notional_30d_volume: 150.0,
      last_updated_ms: 1551371446000,
      date: '2019-02-28',
      notional_1d_volume: [
        {
          date: '2019-02-22',
          notional_volume: 75.0,
        },
        {
          date: '2019-02-14',
          notional_volume: 75.0,
        },
      ],
    };
    const request = '/v1/notionalvolume';
    const nonce = 1;
    const payload = { request, nonce };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .getNotionalVolume()
      .then(data => {
        assert.deepEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.getTradeVolume()', done => {
    const response = [
      [
        {
          account_id: 5365,
          symbol: 'btcusd',
          base_currency: 'BTC',
          notional_currency: 'USD',
          data_date: '2019-01-10',
          total_volume_base: 8.06021756,
          maker_buy_sell_ratio: 1,
          buy_maker_base: 6.06021756,
          buy_maker_notional: 23461.3515203844,
          buy_maker_count: 34,
          sell_maker_base: 0,
          sell_maker_notional: 0,
          sell_maker_count: 0,
          buy_taker_base: 0,
          buy_taker_notional: 0,
          buy_taker_count: 0,
          sell_taker_base: 2,
          sell_taker_notional: 7935.66,
          sell_taker_count: 2,
        },
        {
          account_id: 5365,
          symbol: 'ltcusd',
          base_currency: 'LTC',
          notional_currency: 'USD',
          data_date: '2019-01-11',
          total_volume_base: 3,
          maker_buy_sell_ratio: 0,
          buy_maker_base: 0,
          buy_maker_notional: 0,
          buy_maker_count: 0,
          sell_maker_base: 0,
          sell_maker_notional: 0,
          sell_maker_count: 0,
          buy_taker_base: 3,
          buy_taker_notional: 98.22,
          buy_taker_count: 3,
          sell_taker_base: 0,
          sell_taker_notional: 0,
          sell_taker_count: 0,
        },
      ],
    ];
    const request = '/v1/tradevolume';
    const nonce = 1;
    const payload = { request, nonce };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .getTradeVolume()
      .then(data => {
        assert.deepEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });
});
