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
