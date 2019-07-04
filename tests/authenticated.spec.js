const assert = require('assert');
const nock = require('nock');

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
});
