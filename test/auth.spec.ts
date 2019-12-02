import * as assert from "assert";
import * as nock from "nock";
import {
  AuthenticatedClient,
  Headers,
  ApiUri,
  SignRequest,
  Account,
  Balance,
  AccountInfo,
  GUSDWithdrawal,
  Heartbeat
} from "../index";

const key = "Gemini-API-KEY";
const secret = "Gemini-API-SECRET";

const client = new AuthenticatedClient({ key, secret });
const nonce = Date.now();
const _nonce = () => nonce;
client.nonce = _nonce;

suite("AuthenticatedClient", () => {
  test("constructor", () => {
    const sandbox = true;
    const apiUri = "https://new-gemini-api-uri.com";
    const timeout = 9000;
    const symbol = "zecbtc";
    const client = new AuthenticatedClient({
      sandbox,
      apiUri,
      timeout,
      symbol,
      key,
      secret
    });
    client.nonce = _nonce;
    assert.deepStrictEqual(client._rpoptions, {
      timeout,
      baseUrl: apiUri,
      json: true,
      headers: Headers
    });
    assert.deepStrictEqual(client.symbol, symbol);
    assert.deepStrictEqual(client.key, key);
    assert.deepStrictEqual(client.secret, secret);
    assert.deepStrictEqual(client.nonce, _nonce);
  });

  test(".getAvailableBalances()", async () => {
    const request = "/v1/balances";
    const account = "primary";
    const options = { request, account, nonce };
    const response: Balance[] = [
      {
        type: "exchange",
        currency: "BTC",
        amount: "1154.62034001",
        available: "1129.10517279",
        availableForWithdrawal: "1129.10517279"
      },
      {
        type: "exchange",
        currency: "USD",
        amount: "18722.79",
        available: "14481.62",
        availableForWithdrawal: "14481.62"
      },
      {
        type: "exchange",
        currency: "ETH",
        amount: "20124.50369697",
        available: "20124.50369697",
        availableForWithdrawal: "20124.50369697"
      }
    ];
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.getAvailableBalances({ account });
    assert.deepStrictEqual(data, response);
  });

  test(".createAccount()", async () => {
    const request = "/v1/account/create";
    const name = "name";
    const type = "custody";
    const options = { request, name, type, nonce };
    const response: Account = { name, type };
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.createAccount({ name, type });
    assert.deepStrictEqual(data, response);
  });

  test(".getAccounts()", async () => {
    const request = "/v1/account/list";
    const options = { request, nonce };
    const response: AccountInfo[] = [
      {
        name: "Primary",
        account: "primary",
        type: "exchange",
        counterparty_id: "counterparty_id1",
        created: 1494204114215
      },
      {
        name: "test1",
        account: "test1",
        type: "custody",
        counterparty_id: "counterparty_id2",
        created: 1575291112811
      },
      {
        name: "test2",
        account: "test2",
        type: "exchange",
        counterparty_id: "counterparty_id3",
        created: 1575293113336
      }
    ];
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.getAccounts();
    assert.deepStrictEqual(data, response);
  });

  test(".withdrawGUSD()", async () => {
    const request = "/v1/withdraw/usd";
    const address = "0x0F2B20Acb2fD7EEbC0ABc3AEe0b00d57533b6bD1";
    const amount = "500";
    const account = "primary";
    const options = { request, address, amount, account, nonce };
    const response: GUSDWithdrawal = {
      destination: "0x0F2B20Acb2fD7EEbC0ABc3AEe0b00d57533b6bD2",
      amount: "500",
      txHash: "6b74434ce7b12360e8c2f0321a9d6302d13beff4d707933a943a6aa267267c93"
    };
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.withdrawGUSD({
      address,
      amount,
      account
    });
    assert.deepStrictEqual(data, response);
  });

  test(".heartbeat()", async () => {
    const request = "/v1/heartbeat";
    const options = { request, nonce };
    const response: Heartbeat = { result: "ok" };
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.heartbeat();
    assert.deepStrictEqual(data, response);
  });
});
