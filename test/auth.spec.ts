import * as assert from "assert";
import * as nock from "nock";
import {
  AuthenticatedClient,
  Headers,
  ApiUri,
  SignRequest,
  DefaultSymbol,
  OrderStatus,
  Account,
  Balance,
  Transfer,
  NewAddress,
  Withdrawal,
  InternalTransferResponse,
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

  test(".newOrder()", async () => {
    const request = "/v1/order/new";
    const account = "primary";
    const amount = 0.1;
    const client_order_id = "470135";
    const price = 10500;
    const symbol = "btcusd";
    const type = "exchange stop limit";
    const side = "buy";
    const stop_price = 10000;
    const options = {
      request,
      symbol,
      account,
      amount,
      client_order_id,
      price,
      type,
      side,
      stop_price,
      nonce
    };
    const response: OrderStatus = {
      order_id: "107317752",
      id: "107317752",
      symbol: "ethusd",
      exchange: "gemini",
      avg_execution_price: "126.25",
      side: "buy",
      type: "market buy",
      timestamp: "1547236481",
      timestampms: 1547236481910,
      is_live: false,
      is_cancelled: false,
      is_hidden: false,
      was_forced: false,
      executed_amount: "0.54517172",
      remaining_amount: "0",
      options: []
    };
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.newOrder({
      account,
      amount,
      client_order_id,
      price,
      symbol,
      type,
      side,
      stop_price
    });
    assert.deepStrictEqual(data, response);
  });

  test(".buy() (using the default `symbol`)", async () => {
    const request = "/v1/order/new";
    const account = "primary";
    const amount = 0.1;
    const client_order_id = "470135";
    const price = 10500;
    const type = "exchange stop limit";
    const stop_price = 10000;
    const options = {
      request,
      symbol: DefaultSymbol,
      account,
      amount,
      client_order_id,
      price,
      type,
      stop_price,
      side: "buy",
      nonce
    };
    const response: OrderStatus = {
      order_id: "107317752",
      id: "107317752",
      symbol: "ethusd",
      exchange: "gemini",
      avg_execution_price: "126.25",
      side: "buy",
      type: "market buy",
      timestamp: "1547236481",
      timestampms: 1547236481910,
      is_live: false,
      is_cancelled: false,
      is_hidden: false,
      was_forced: false,
      executed_amount: "0.54517172",
      remaining_amount: "0",
      options: []
    };
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.buy({
      account,
      amount,
      client_order_id,
      price,
      type,
      stop_price
    });
    assert.deepStrictEqual(data, response);
  });

  test(".sell() (using the default `symbol`)", async () => {
    const request = "/v1/order/new";
    const account = "primary";
    const amount = 0.1;
    const client_order_id = "470135";
    const price = 10500;
    const type = "exchange stop limit";
    const stop_price = 10000;
    const options = {
      request,
      symbol: DefaultSymbol,
      account,
      amount,
      client_order_id,
      price,
      type,
      stop_price,
      side: "sell",
      nonce
    };
    const response: OrderStatus = {
      order_id: "107317752",
      id: "107317752",
      symbol: "ethusd",
      exchange: "gemini",
      avg_execution_price: "126.25",
      side: "sell",
      type: "market buy",
      timestamp: "1547236481",
      timestampms: 1547236481910,
      is_live: false,
      is_cancelled: false,
      is_hidden: false,
      was_forced: false,
      executed_amount: "0.54517172",
      remaining_amount: "0",
      options: []
    };
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.sell({
      account,
      amount,
      client_order_id,
      price,
      type,
      stop_price
    });
    assert.deepStrictEqual(data, response);
  });

  test(".cancelOrder()", async () => {
    const request = "/v1/order/cancel";
    const account = "primary";
    const order_id = 106817811;
    const options = { request, order_id, account, nonce };
    const response: OrderStatus = {
      order_id: "106817811",
      id: "106817811",
      symbol: "btcusd",
      exchange: "gemini",
      avg_execution_price: "3632.85101103",
      side: "buy",
      type: "exchange limit",
      timestamp: "1547220404",
      timestampms: 1547220404836,
      is_live: false,
      is_cancelled: false,
      is_hidden: false,
      was_forced: false,
      executed_amount: "3.7610296649",
      remaining_amount: "1.2389703351",
      reason: "Requested",
      options: [],
      price: "3633.00",
      original_amount: "5"
    };
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.cancelOrder({ order_id, account });
    assert.deepStrictEqual(data, response);
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

  test(".getTransfers()", async () => {
    const request = "/v1/transfers";
    const account = "primary";
    const timestamp = 1;
    const limit_transfers = 10;
    const options = { request, limit_transfers, timestamp, account, nonce };
    const response: Transfer[] = [
      {
        type: "Deposit",
        status: "Advanced",
        timestampms: 1507913541275,
        eid: 320013281,
        currency: "USD",
        amount: "36.00",
        method: "ACH"
      },
      {
        type: "Deposit",
        status: "Advanced",
        timestampms: 1499990797452,
        eid: 309356152,
        currency: "ETH",
        amount: "100",
        txHash:
          "605c5fa8bf99458d24d61e09941bc443ddc44839d9aaa508b14b296c0c8269b2"
      },
      {
        type: "Deposit",
        status: "Complete",
        timestampms: 1495550176562,
        eid: 298112782,
        currency: "BTC",
        amount: "1500",
        txHash:
          "163eeee4741f8962b748289832dd7f27f754d892f5d23bf3ea6fba6e350d9ce3",
        outputIdx: 0
      },
      {
        type: "Deposit",
        status: "Advanced",
        timestampms: 1458862076082,
        eid: 265799530,
        currency: "USD",
        amount: "500.00",
        method: "ACH"
      },
      {
        type: "Withdrawal",
        status: "Complete",
        timestampms: 1450403787001,
        eid: 82897811,
        currency: "BTC",
        amount: "5",
        txHash:
          "c458b86955b80db0718cfcadbff3df3734a906367982c6eb191e61117b810bbb",
        outputIdx: 0,
        destination: "mqjvCtt4TJfQaC7nUgLMvHwuDPXMTEUGqx"
      },
      {
        type: "Withdrawal",
        status: "Complete",
        timestampms: 1535451930431,
        eid: 341167014,
        currency: "USD",
        amount: "1.00",
        txHash:
          "7bffd85893ee8e72e31061a84d25c45f2c4537c2f765a1e79feb06a7294445c3",
        destination: "0xd24400ae8BfEBb18cA49Be86258a3C749cf46853"
      }
    ];
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.getTransfers({
      limit_transfers,
      timestamp,
      account
    });
    assert.deepStrictEqual(data, response);
  });

  test(".getNewAddress()", async () => {
    const currency = "LTC";
    const request = "/v1/deposit/" + currency + "/newAddress";
    const label = "New deposit address";
    const legacy = false;
    const account = "primary";
    const options = { request, label, legacy, account, nonce };
    const response: NewAddress = {
      currency,
      address: "ltc1qdmx34geqhrnmgldcqkr79wwl3yxldsvhhz7t49",
      label
    };
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.getNewAddress({
      currency,
      label,
      legacy,
      account
    });
    assert.deepStrictEqual(data, response);
  });

  test(".withdrawCrypto()", async () => {
    const currency = "btc";
    const request = "/v1/withdraw/" + currency;
    const address = "1KA8QNcgdcVERrAaKF1puKndB7Q7MMg5PR";
    const amount = 1;
    const account = "primary";
    const options = { request, address, amount, account, nonce };
    const response: Withdrawal = {
      address: "1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen",
      amount: "1",
      withdrawalId: "02176a83-a6b1-4202-9b85-1c1c92dd25c4",
      message:
        "You have requested a transfer of 1 BTC to 1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen. This withdrawal will be sent to the blockchain within the next 60 seconds."
    };
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.withdrawCrypto({
      currency,
      address,
      amount,
      account
    });
    assert.deepStrictEqual(data, response);
  });

  test(".internalTransfer()", async () => {
    const currency = "btc";
    const request = "/v1/account/transfer/" + currency;
    const sourceAccount = "my-account";
    const targetAccount = "my-other-account";
    const amount = 1;
    const options = { request, sourceAccount, targetAccount, amount, nonce };
    const response: InternalTransferResponse = {
      uuid: "9c153d64-83ba-4532-a159-ebe3f6797766"
    };
    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, options }) } })
      .post(request, {})
      .reply(200, response);

    const data = await client.internalTransfer({
      currency,
      sourceAccount,
      targetAccount,
      amount
    });
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
    const amount = 500;
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
