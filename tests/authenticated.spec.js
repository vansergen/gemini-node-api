const assert = require('assert');
const nock = require('nock');
const Promise = require('bluebird');

const { AuthenticatedClient, SignRequest } = require('../index.js');
const { API_LIMIT, EXCHANGE_API_URL } = require('../lib/utilities');

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
      const message = '`options` is missing a required property: `secret`';
      assert.deepStrictEqual(error.message, message);
      done();
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
        assert.deepStrictEqual(data, response);
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
      authClient.cb({ _method: 'post', ...payload }, callback);
    });

    const preq = authClient
      .post(payload)
      .then(data => {
        assert.deepStrictEqual(data, response);
      })
      .catch(error => assert.fail(error));
    return Promise.all([cbreq, preq]);
  });

  test('.newOrder()', done => {
    const symbol = 'btcusd';
    const client_order_id = '20190110-4738721';
    const amount = 5;
    const min_amount = 1;
    const price = 3633.0;
    const side = 'buy';
    const moc = true;
    const ioc = false;
    const fok = false;
    const ao = false;
    const ioi = false;
    const type = 'exchange limit';

    const request = '/v1/order/new';
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = {
      request,
      client_order_id,
      symbol,
      amount,
      min_amount,
      price,
      side,
      type,
      options: ['maker-or-cancel'],
      nonce,
    };
    const response = {
      order_id: '106817811',
      id: '106817811',
      symbol: 'btcusd',
      exchange: 'gemini',
      avg_execution_price: '3632.8508430064554',
      side: 'buy',
      type: 'exchange limit',
      timestamp: '1547220404',
      timestampms: 1547220404836,
      is_live: true,
      is_cancelled: false,
      is_hidden: false,
      was_forced: false,
      executed_amount: '3.7567928949',
      remaining_amount: '1.2432071051',
      client_order_id: '20190110-4738721',
      options: [],
      price: '3633.00',
      original_amount: '5',
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .newOrder({
        symbol,
        client_order_id,
        amount,
        min_amount,
        price,
        side,
        moc,
        ioc,
        fok,
        ao,
        ioi,
      })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.newOrder() (with default symbol)', done => {
    const symbol = 'zecbtc';
    const amount = 1;
    const price = 1;
    const side = 'buy';
    const type = 'exchange limit';

    const request = '/v1/order/new';

    const client = new AuthenticatedClient({ symbol, key, secret });
    const nonce = 1;
    client.nonce = () => nonce;

    const payload = {
      request,
      symbol,
      amount,
      price,
      side,
      type,
      options: [],
      nonce,
    };
    const response = {
      order_id: '106817811',
      id: '106817811',
      symbol: 'zecbtc',
      exchange: 'gemini',
      avg_execution_price: '1',
      side: 'buy',
      type: 'exchange limit',
      timestamp: '1547220404',
      timestampms: 1547220404836,
      is_live: true,
      is_cancelled: false,
      is_hidden: false,
      was_forced: false,
      executed_amount: '1',
      remaining_amount: '0',
      client_order_id: '20190110-4738721',
      options: [],
      price: '1',
      original_amount: '1',
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    client
      .newOrder({ amount, price, side })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.buy() (ignores `side`)', done => {
    const symbol = 'btcusd';
    const client_order_id = '20190110-4738721';
    const amount = 5;
    const min_amount = 1;
    const price = 3633.0;
    const side = 'buy';
    const moc = true;
    const ioc = false;
    const fok = false;
    const ao = false;
    const ioi = false;
    const type = 'exchange limit';

    const request = '/v1/order/new';
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = {
      request,
      client_order_id,
      symbol,
      amount,
      min_amount,
      price,
      side,
      type,
      options: ['maker-or-cancel'],
      nonce,
    };
    const response = {
      order_id: '106817811',
      id: '106817811',
      symbol: 'btcusd',
      exchange: 'gemini',
      avg_execution_price: '3632.8508430064554',
      side: 'buy',
      type: 'exchange limit',
      timestamp: '1547220404',
      timestampms: 1547220404836,
      is_live: true,
      is_cancelled: false,
      is_hidden: false,
      was_forced: false,
      executed_amount: '3.7567928949',
      remaining_amount: '1.2432071051',
      client_order_id: '20190110-4738721',
      options: [],
      price: '3633.00',
      original_amount: '5',
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .buy({
        symbol,
        client_order_id,
        amount,
        min_amount,
        price,
        side: 'sell',
        moc,
        ioc,
        fok,
        ao,
        ioi,
      })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.sell() (ignores `side`)', done => {
    const symbol = 'btcusd';
    const client_order_id = '20190110-4738721';
    const amount = 5;
    const min_amount = 1;
    const price = 3633.0;
    const side = 'sell';
    const moc = true;
    const ioc = false;
    const fok = false;
    const ao = false;
    const ioi = false;
    const type = 'exchange limit';

    const request = '/v1/order/new';
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = {
      request,
      client_order_id,
      symbol,
      amount,
      min_amount,
      price,
      side,
      type,
      options: ['maker-or-cancel'],
      nonce,
    };
    const response = {
      order_id: '106817811',
      id: '106817811',
      symbol: 'btcusd',
      exchange: 'gemini',
      avg_execution_price: '3632.8508430064554',
      side: 'buy',
      type: 'exchange limit',
      timestamp: '1547220404',
      timestampms: 1547220404836,
      is_live: true,
      is_cancelled: false,
      is_hidden: false,
      was_forced: false,
      executed_amount: '3.7567928949',
      remaining_amount: '1.2432071051',
      client_order_id: '20190110-4738721',
      options: [],
      price: '3633.00',
      original_amount: '5',
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .sell({
        symbol,
        client_order_id,
        amount,
        min_amount,
        price,
        side: 'buy',
        moc,
        ioc,
        fok,
        ao,
        ioi,
      })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.cancelOrder()', done => {
    const order_id = 106817811;

    const request = '/v1/order/cancel';
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = { request, order_id, nonce };
    const response = {
      order_id: '106817811',
      id: '106817811',
      symbol: 'btcusd',
      exchange: 'gemini',
      avg_execution_price: '3632.85101103',
      side: 'buy',
      type: 'exchange limit',
      timestamp: '1547220404',
      timestampms: 1547220404836,
      is_live: false,
      is_cancelled: true,
      is_hidden: false,
      was_forced: false,
      executed_amount: '3.7610296649',
      remaining_amount: '1.2389703351',
      reason: 'Requested',
      options: [],
      price: '3633.00',
      original_amount: '5',
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .cancelOrder({ order_id })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.cancelSession()', done => {
    const request = '/v1/order/cancel/session';
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = { request, nonce };
    const response = {
      result: 'ok',
      details: {
        cancelledOrders: [330429345],
        cancelRejects: [],
      },
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .cancelSession()
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.cancelAll()', done => {
    const request = '/v1/order/cancel/all';
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = { request, nonce };
    const response = {
      result: 'ok',
      details: {
        cancelRejects: [],
        cancelledOrders: [330429106, 330429079, 330429082],
      },
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .cancelAll()
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.getOrderStatus()', done => {
    const order_id = 44375901;

    const request = '/v1/order/status';
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = { request, order_id, nonce };
    const response = {
      order_id: '107317752',
      id: '107317752',
      symbol: 'ethusd',
      exchange: 'gemini',
      avg_execution_price: '126.25',
      side: 'buy',
      type: 'market buy',
      timestamp: '1547236481',
      timestampms: 1547236481910,
      is_live: 'False',
      is_cancelled: 'False',
      is_hidden: 'False',
      was_forced: 'False',
      executed_amount: '0.54517172',
      remaining_amount: '0',
      options: [],
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .getOrderStatus({ order_id })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.getActiveOrders()', done => {
    const response = [
      {
        order_id: '107421210',
        id: '107421210',
        symbol: 'ethusd',
        exchange: 'gemini',
        avg_execution_price: '0.00',
        side: 'sell',
        type: 'exchange limit',
        timestamp: '1547241628',
        timestampms: 1547241628042,
        is_live: true,
        is_cancelled: false,
        is_hidden: false,
        was_forced: false,
        executed_amount: '0',
        remaining_amount: '1',
        options: [],
        price: '125.51',
        original_amount: '1',
      },
      {
        order_id: '107421205',
        id: '107421205',
        symbol: 'ethusd',
        exchange: 'gemini',
        avg_execution_price: '125.41',
        side: 'buy',
        type: 'exchange limit',
        timestamp: '1547241626',
        timestampms: 1547241626991,
        is_live: true,
        is_cancelled: false,
        is_hidden: false,
        was_forced: false,
        executed_amount: '0.029147',
        remaining_amount: '0.970853',
        options: [],
        price: '125.42',
        original_amount: '1',
      },
    ];
    const request = '/v1/orders';
    const nonce = 1;
    const payload = { request, nonce };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .getActiveOrders()
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.getPastTrades()', done => {
    const symbol = 'btcusd';
    const limit_trades = 2;
    const timestamp = 1547220639;

    const request = '/v1/mytrades';
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = { request, symbol, limit_trades, timestamp, nonce };
    const response = [
      {
        price: '3648.09',
        amount: '0.0027343246',
        timestamp: 1547232911,
        timestampms: 1547232911021,
        type: 'Buy',
        aggressor: true,
        fee_currency: 'USD',
        fee_amount: '0.024937655575035',
        tid: 107317526,
        order_id: '107317524',
        exchange: 'gemini',
        is_auction_fill: false,
      },
      {
        price: '3633.00',
        amount: '0.00423677',
        timestamp: 1547220640,
        timestampms: 1547220640195,
        type: 'Buy',
        aggressor: false,
        fee_currency: 'USD',
        fee_amount: '0.038480463525',
        tid: 106921823,
        order_id: '106817811',
        exchange: 'gemini',
        is_auction_fill: false,
      },
    ];
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .getPastTrades({ symbol, limit_trades, timestamp })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.getPastTrades() (with default symbol)', done => {
    const symbol = 'zecbtc';
    const limit_trades = API_LIMIT;

    const client = new AuthenticatedClient({ symbol, key, secret });

    const request = '/v1/mytrades';
    const nonce = 1;
    client.nonce = () => nonce;

    const payload = { request, symbol, limit_trades, nonce };
    const response = [];
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    client
      .getPastTrades()
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
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
        assert.deepStrictEqual(data, response);
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
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.getAvailableBalances()', done => {
    const response = [
      {
        type: 'exchange',
        currency: 'BTC',
        amount: '1154.62034001',
        available: '1129.10517279',
        availableForWithdrawal: '1129.10517279',
      },
      {
        type: 'exchange',
        currency: 'USD',
        amount: '18722.79',
        available: '14481.62',
        availableForWithdrawal: '14481.62',
      },
      {
        type: 'exchange',
        currency: 'ETH',
        amount: '20124.50369697',
        available: '20124.50369697',
        availableForWithdrawal: '20124.50369697',
      },
    ];
    const request = '/v1/balances';
    const nonce = 1;
    const payload = { request, nonce };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .getAvailableBalances()
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.getTransfers()', done => {
    const response = [
      {
        type: 'Deposit',
        status: 'Advanced',
        timestampms: 1507913541275,
        eid: 320013281,
        currency: 'USD',
        amount: '36.00',
        method: 'ACH',
      },
      {
        type: 'Deposit',
        status: 'Advanced',
        timestampms: 1499990797452,
        eid: 309356152,
        currency: 'ETH',
        amount: '100',
        txHash:
          '605c5fa8bf99458d24d61e09941bc443ddc44839d9aaa508b14b296c0c8269b2',
      },
      {
        type: 'Deposit',
        status: 'Complete',
        timestampms: 1495550176562,
        eid: 298112782,
        currency: 'BTC',
        amount: '1500',
        txHash:
          '163eeee4741f8962b748289832dd7f27f754d892f5d23bf3ea6fba6e350d9ce3',
        outputIdx: 0,
      },
      {
        type: 'Deposit',
        status: 'Advanced',
        timestampms: 1458862076082,
        eid: 265799530,
        currency: 'USD',
        amount: '500.00',
        method: 'ACH',
      },
      {
        type: 'Withdrawal',
        status: 'Complete',
        timestampms: 1450403787001,
        eid: 82897811,
        currency: 'BTC',
        amount: '5',
        txHash:
          'c458b86955b80db0718cfcadbff3df3734a906367982c6eb191e61117b810bbb',
        outputIdx: 0,
        destination: 'mqjvCtt4TJfQaC7nUgLMvHwuDPXMTEUGqx',
      },
      {
        type: 'Withdrawal',
        status: 'Complete',
        timestampms: 1535451930431,
        eid: 341167014,
        currency: 'USD',
        amount: '1.00',
        txHash:
          '7bffd85893ee8e72e31061a84d25c45f2c4537c2f765a1e79feb06a7294445c3',
        destination: '0xd24400ae8BfEBb18cA49Be86258a3C749cf46853',
      },
    ];
    const request = '/v1/transfers';
    const nonce = 1;
    const timestamp = 1;
    const limit_transfers = 6;
    const payload = { request, timestamp, limit_transfers, nonce };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .getTransfers({ timestamp, limit_transfers })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.getNewAddress()', done => {
    const currency = 'LTC';
    const request = '/v1/deposit/' + currency + '/newAddress';
    const label = 'New deposit address';
    const legacy = false;
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = { request, label, legacy, nonce };
    const response = {
      currency,
      address: 'ltc1qdmx34geqhrnmgldcqkr79wwl3yxldsvhhz7t49',
      label,
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .getNewAddress({ currency, label, legacy })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.withdrawCrypto()', done => {
    const currency = 'btc';
    const request = '/v1/withdraw/' + currency;
    const address = '1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen';
    const amount = 1;
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = { request, address, amount, nonce };
    const response = {
      address: '1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen',
      amount: '1',
      withdrawalId: '02176a83-a6b1-4202-9b85-1c1c92dd25c4',
      message:
        'You have requested a transfer of 1 BTC to 1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen. This withdrawal will be sent to the blockchain within the next 60 seconds.',
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .withdrawCrypto({ currency, address, amount })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.withdrawGUSD()', done => {
    const request = '/v1/withdraw/usd';
    const address = '0x943a6C7e15FEc0555528266a44D573a6E1A21DBD';
    const amount = 50000;
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = { request, address, amount, nonce };
    const response = {
      destination: address,
      amount,
      txHash:
        '6b74434ce7b12360e8c2f0321a9d6302d13beff4d707933a943a6aa267267c93',
    };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .withdrawGUSD({ address, amount })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test('.heartbeat()', done => {
    const request = '/v1/heartbeat';
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = { request, nonce };
    const response = { result: 'ok' };
    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .heartbeat()
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });
});
