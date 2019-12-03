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
