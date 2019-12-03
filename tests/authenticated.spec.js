const assert = require("assert");
const nock = require("nock");

const { AuthenticatedClient, SignRequest } = require("../index.js");
const { API_LIMIT, EXCHANGE_API_URL } = require("../lib/utilities.js");

const key = "Gemini-API-KEY";
const secret = "Gemini-API-SECRET";
const auth = { key, secret };

const authClient = new AuthenticatedClient(auth);

suite("AuthenticatedClient", () => {
  teardown(() => nock.cleanAll());

  test(".post()", done => {
    const response = {
      currency: "BTC",
      address: "1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen"
    };
    const request = "/v1/deposit/btc/newAddress";
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

  test(".getPastTrades()", done => {
    const symbol = "btcusd";
    const limit_trades = 2;
    const timestamp = 1547220639;

    const request = "/v1/mytrades";
    const nonce = 1;
    authClient.nonce = () => nonce;

    const payload = { request, symbol, limit_trades, timestamp, nonce };
    const response = [
      {
        price: "3648.09",
        amount: "0.0027343246",
        timestamp: 1547232911,
        timestampms: 1547232911021,
        type: "Buy",
        aggressor: true,
        fee_currency: "USD",
        fee_amount: "0.024937655575035",
        tid: 107317526,
        order_id: "107317524",
        exchange: "gemini",
        is_auction_fill: false
      },
      {
        price: "3633.00",
        amount: "0.00423677",
        timestamp: 1547220640,
        timestampms: 1547220640195,
        type: "Buy",
        aggressor: false,
        fee_currency: "USD",
        fee_amount: "0.038480463525",
        tid: 106921823,
        order_id: "106817811",
        exchange: "gemini",
        is_auction_fill: false
      }
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

  test(".getPastTrades() (with default symbol)", done => {
    const symbol = "zecbtc";
    const limit_trades = API_LIMIT;

    const client = new AuthenticatedClient({ symbol, key, secret });

    const request = "/v1/mytrades";
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

  test(".getNotionalVolume()", done => {
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
      date: "2019-02-28",
      notional_1d_volume: [
        {
          date: "2019-02-22",
          notional_volume: 75.0
        },
        {
          date: "2019-02-14",
          notional_volume: 75.0
        }
      ]
    };
    const request = "/v1/notionalvolume";
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

  test(".getTradeVolume()", done => {
    const response = [
      [
        {
          account_id: 5365,
          symbol: "btcusd",
          base_currency: "BTC",
          notional_currency: "USD",
          data_date: "2019-01-10",
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
          sell_taker_count: 2
        },
        {
          account_id: 5365,
          symbol: "ltcusd",
          base_currency: "LTC",
          notional_currency: "USD",
          data_date: "2019-01-11",
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
          sell_taker_count: 0
        }
      ]
    ];
    const request = "/v1/tradevolume";
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

  test(".newClearingOrder()", done => {
    const response = {
      result: "AwaitConfirm",
      clearing_id: "0OQGOZXW"
    };
    const request = "/v1/clearing/new";
    const nonce = 1;
    const counterparty_id = "OM9VNL1G";
    const expires_in_hrs = 24;
    const symbol = "btcusd";
    const amount = 100;
    const price = 9500;
    const side = "buy";
    const payload = {
      request,
      symbol,
      amount,
      price,
      side,
      expires_in_hrs,
      counterparty_id,
      nonce
    };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .newClearingOrder({
        symbol,
        amount,
        price,
        side,
        expires_in_hrs,
        counterparty_id
      })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test(".getClearingOrderStatus()", done => {
    const response = {
      result: "ok",
      status: "Confirmed"
    };
    const request = "/v1/clearing/status";
    const nonce = 1;
    const clearing_id = "OM9VNL1G";
    const payload = {
      request,
      clearing_id,
      nonce
    };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .getClearingOrderStatus({ clearing_id })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test(".cancelClearingOrder()", done => {
    const response = {
      result: "ok",
      details: "P0521QDV order canceled"
    };
    const request = "/v1/clearing/cancel";
    const nonce = 1;
    const clearing_id = "P0521QDV";
    const payload = {
      request,
      clearing_id,
      nonce
    };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .cancelClearingOrder({ clearing_id })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });

  test(".confirmClearingOrder()", done => {
    const response = {
      result: "confirmed"
    };
    const request = "/v1/clearing/confirm";
    const nonce = 1;
    const clearing_id = "OM9VNL1G";
    const symbol = "btcusd";
    const amount = 100;
    const price = 9500;
    const side = "sell";
    const payload = {
      request,
      symbol,
      clearing_id,
      amount,
      price,
      side,
      nonce
    };
    authClient.nonce = () => nonce;

    nock(EXCHANGE_API_URL, { reqheaders: SignRequest(auth, payload) })
      .post(request)
      .times(1)
      .reply(200, response);

    authClient
      .confirmClearingOrder({
        clearing_id,
        symbol,
        amount,
        price,
        side
      })
      .then(data => {
        assert.deepStrictEqual(data, response);
        done();
      })
      .catch(error => assert.fail(error));
  });
});
