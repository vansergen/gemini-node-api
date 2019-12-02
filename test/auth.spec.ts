import * as assert from "assert";
import * as nock from "nock";
import {
  AuthenticatedClient,
  Headers,
  ApiUri,
  SignRequest,
  Account,
  AccountInfo
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
});
