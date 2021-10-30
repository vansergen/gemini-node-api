import { deepStrictEqual, fail, ok, rejects } from "node:assert";
import { Server } from "node:http";
import nock from "nock";
import { FetchError } from "node-fetch";
import {
  ApiLimit,
  AuthenticatedClient,
  ApiUri,
  SignRequest,
  DefaultSymbol,
  OrderStatus,
  CancelOrdersResponse,
  PastTrade,
  NotionalVolume,
  TradeVolume,
  NewClearingOrderResponse,
  ClearingOrderStatus,
  CancelClearingOrderResponse,
  ConfirmClearingOptionsResponse,
  Account,
  Balance,
  NotionalBalance,
  Transfer,
  DepositAddress,
  NewAddress,
  Withdrawal,
  InternalTransferResponse,
  AccountInfo,
  GUSDWithdrawal,
  Heartbeat,
} from "../index.js";

const key = "Gemini-API-KEY";
const secret = "Gemini-API-SECRET";

const client = new AuthenticatedClient({ key, secret });
const nonce = Date.now();
const _nonce = (): number => nonce;
client.nonce = _nonce;

suite("AuthenticatedClient", () => {
  test("constructor", () => {
    const sandbox = true;
    const apiUri = "https://new-gemini-api-uri.com";
    const symbol = "zecbtc";
    const otherClient = new AuthenticatedClient({
      sandbox,
      apiUri,
      symbol,
      key,
      secret,
    });
    otherClient.nonce = _nonce;
    deepStrictEqual(otherClient.apiUri, apiUri);
    deepStrictEqual(otherClient.symbol, symbol);
    deepStrictEqual(otherClient.nonce, _nonce);
  });

  test(".post() (reject non 2xx responses)", async () => {
    const uri = "/v1/symbols";
    const response = {
      result: "error",
      reason: "RateLimit",
      message: "Requests were made too frequently",
    };

    nock(ApiUri).post(uri).delay(1).reply(429, response);

    await rejects(client.post(uri, {}), new Error(response.message));
  });

  test(".post() (reject non 2xx responses when no message is provided) ", async () => {
    const uri = "/v1/symbols";
    const response = {
      result: "error",
      reason: "RateLimit",
    };

    nock(ApiUri).post(uri).delay(1).reply(429, response);

    await rejects(client.post(uri, {}), new Error(response.reason));
  });

  test(".post() (reject non 2xx responses with invalid JSON response) ", async () => {
    const response = "Not valid JSON";
    nock(ApiUri).post("/").delay(1).reply(429, response);

    let path: undefined;

    await rejects(
      client.post(path, {}),
      new SyntaxError("Unexpected token N in JSON at position 0")
    );
  });

  test(".post() (reject on errors)", async () => {
    const port = 28080;
    const apiUri = `http://127.0.0.1:${port}`;
    const server = await new Promise<Server>((resolve) => {
      const _server = new Server((_request, response) => {
        response.destroy();
      });
      _server
        .on("listening", () => {
          resolve(_server);
        })
        .listen(port);
    });

    const otherClient = new AuthenticatedClient({ apiUri, key, secret });
    const uri = "/v1/symbols";
    try {
      await otherClient.post(uri, {});
      fail("Should throw an error");
    } catch (error) {
      ok(error instanceof FetchError);
    }
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
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
      nonce,
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
      options: [],
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.newOrder({
      account,
      amount,
      client_order_id,
      price,
      symbol,
      type,
      side,
      stop_price,
    });
    deepStrictEqual(data, response);
  });

  test(".newOrder() (with no `symbol`)", async () => {
    const request = "/v1/order/new";
    const account = "primary";
    const amount = 0.1;
    const client_order_id = "470135";
    const price = 10500;
    const symbol = DefaultSymbol;
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
      nonce,
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
      options: [],
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.newOrder({
      account,
      amount,
      client_order_id,
      price,
      type,
      side,
      stop_price,
    });
    deepStrictEqual(data, response);
  });

  test(".buy() (with no `symbol`)", async () => {
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
      nonce,
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
      options: [],
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.buy({
      account,
      amount,
      client_order_id,
      price,
      type,
      stop_price,
    });
    deepStrictEqual(data, response);
  });

  test(".sell() (with no `symbol`)", async () => {
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
      nonce,
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
      options: [],
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.sell({
      account,
      amount,
      client_order_id,
      price,
      type,
      stop_price,
    });
    deepStrictEqual(data, response);
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
      original_amount: "5",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.cancelOrder({ order_id, account });
    deepStrictEqual(data, response);
  });

  test(".cancelSession()", async () => {
    const request = "/v1/order/cancel/session";
    const account = "primary";
    const options = { request, account, nonce };
    const response: CancelOrdersResponse = {
      result: "ok",
      details: {
        cancelledOrders: [330429345],
        cancelRejects: [],
      },
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.cancelSession({ account });
    deepStrictEqual(data, response);
  });

  test(".cancelAll()", async () => {
    const request = "/v1/order/cancel/all";
    const account = "primary";
    const options = { request, account, nonce };
    const response: CancelOrdersResponse = {
      result: "ok",
      details: {
        cancelRejects: [],
        cancelledOrders: [330429106, 330429079, 330429082],
      },
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.cancelAll({ account });
    deepStrictEqual(data, response);
  });

  test(".getOrderStatus()", async () => {
    const request = "/v1/order/status";
    const account = "primary";
    const order_id = 44375901;
    const options = { request, order_id, account, nonce };
    const response: OrderStatus = {
      order_id: "44375901",
      id: "44375901",
      symbol: "btcusd",
      exchange: "gemini",
      avg_execution_price: "400.00",
      side: "buy",
      type: "exchange limit",
      timestamp: "1494870642",
      timestampms: 1494870642156,
      is_live: false,
      is_cancelled: false,
      is_hidden: false,
      was_forced: false,
      executed_amount: "3",
      remaining_amount: "0",
      options: [],
      price: "400.00",
      original_amount: "3",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getOrderStatus({ order_id, account });
    deepStrictEqual(data, response);
  });

  test(".getActiveOrders()", async () => {
    const request = "/v1/orders";
    const account = "primary";
    const options = { request, account, nonce };
    const response: OrderStatus[] = [
      {
        order_id: "107421210",
        id: "107421210",
        symbol: "ethusd",
        exchange: "gemini",
        avg_execution_price: "0.00",
        side: "sell",
        type: "exchange limit",
        timestamp: "1547241628",
        timestampms: 1547241628042,
        is_live: true,
        is_cancelled: false,
        is_hidden: false,
        was_forced: false,
        executed_amount: "0",
        remaining_amount: "1",
        options: [],
        price: "125.51",
        original_amount: "1",
      },
      {
        order_id: "107421205",
        id: "107421205",
        symbol: "ethusd",
        exchange: "gemini",
        avg_execution_price: "125.41",
        side: "buy",
        type: "exchange limit",
        timestamp: "1547241626",
        timestampms: 1547241626991,
        is_live: true,
        is_cancelled: false,
        is_hidden: false,
        was_forced: false,
        executed_amount: "0.029147",
        remaining_amount: "0.970853",
        options: [],
        price: "125.42",
        original_amount: "1",
      },
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getActiveOrders({ account });
    deepStrictEqual(data, response);
  });

  test(".getPastTrades()", async () => {
    const request = "/v1/mytrades";
    const account = "primary";
    const symbol = "bcheth";
    const timestamp = 1547220640194;
    const limit_trades = 2;
    const options = {
      request,
      symbol,
      limit_trades,
      timestamp,
      account,
      nonce,
    };
    const response: PastTrade[] = [
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
        is_auction_fill: false,
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
        is_auction_fill: false,
      },
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getPastTrades({
      timestamp,
      account,
      symbol,
      limit_trades,
    });
    deepStrictEqual(data, response);
  });

  test(".getPastTrades() (with no `symbol`)", async () => {
    const request = "/v1/mytrades";
    const account = "primary";
    const symbol = DefaultSymbol;
    const timestamp = 1547220640194;
    const limit_trades = 2;
    const options = {
      request,
      symbol,
      limit_trades,
      timestamp,
      account,
      nonce,
    };
    const response: PastTrade[] = [
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
        is_auction_fill: false,
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
        is_auction_fill: false,
      },
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getPastTrades({
      timestamp,
      account,
      limit_trades,
    });
    deepStrictEqual(data, response);
  });

  test(".getPastTrades() (with no `limit_trades`)", async () => {
    const request = "/v1/mytrades";
    const account = "primary";
    const symbol = "bcheth";
    const timestamp = 1547220640194;
    const limit_trades = ApiLimit;
    const options = {
      request,
      symbol,
      limit_trades,
      timestamp,
      account,
      nonce,
    };
    const response: PastTrade[] = [
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
        is_auction_fill: false,
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
        is_auction_fill: false,
      },
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getPastTrades({
      timestamp,
      account,
      symbol,
    });
    deepStrictEqual(data, response);
  });

  test(".getPastTrades() (with no arguments)", async () => {
    const request = "/v1/mytrades";
    const symbol = DefaultSymbol;
    const limit_trades = ApiLimit;
    const options = {
      request,
      symbol,
      limit_trades,
      nonce,
    };
    const response: PastTrade[] = [
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
        is_auction_fill: false,
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
        is_auction_fill: false,
      },
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getPastTrades();
    deepStrictEqual(data, response);
  });

  test(".getNotionalVolume()", async () => {
    const request = "/v1/notionalvolume";
    const account = "primary";
    const options = { request, account, nonce };
    const response: NotionalVolume = {
      web_maker_fee_bps: 25,
      web_taker_fee_bps: 35,
      web_auction_fee_bps: 25,
      api_maker_fee_bps: 10,
      api_taker_fee_bps: 35,
      api_auction_fee_bps: 20,
      fix_maker_fee_bps: 10,
      fix_taker_fee_bps: 35,
      fix_auction_fee_bps: 20,
      block_maker_fee_bps: 0,
      block_taker_fee_bps: 50,
      notional_30d_volume: 150.0,
      last_updated_ms: 1551371446000,
      date: "2019-02-28",
      notional_1d_volume: [
        {
          date: "2019-02-22",
          notional_volume: 75.0,
        },
        {
          date: "2019-02-14",
          notional_volume: 75.0,
        },
      ],
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getNotionalVolume({ account });
    deepStrictEqual(data, response);
  });

  test(".getTradeVolume()", async () => {
    const request = "/v1/tradevolume";
    const account = "primary";
    const options = { request, account, nonce };
    const response: TradeVolume[][] = [
      [
        {
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
          sell_taker_count: 2,
        },
        {
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
          sell_taker_count: 0,
        },
      ],
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getTradeVolume({ account });
    deepStrictEqual(data, response);
  });

  test(".newClearingOrder()", async () => {
    const request = "/v1/clearing/new";
    const counterparty_id = "OM9VNL1G";
    const expires_in_hrs = 24;
    const symbol = "ethusd";
    const amount = 100;
    const price = 200;
    const side = "buy";
    const options = {
      request,
      symbol,
      counterparty_id,
      expires_in_hrs,
      amount,
      price,
      side,
      nonce,
    };
    const response: NewClearingOrderResponse = {
      result: "AwaitConfirm",
      clearing_id: "0OQGOZXW",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.newClearingOrder({
      counterparty_id,
      expires_in_hrs,
      amount,
      price,
      side,
      symbol,
    });
    deepStrictEqual(data, response);
  });

  test(".newClearingOrder() (with no `symbol`)", async () => {
    const request = "/v1/clearing/new";
    const counterparty_id = "OM9VNL1G";
    const expires_in_hrs = 24;
    const symbol = DefaultSymbol;
    const amount = 100;
    const price = 200;
    const side = "buy";
    const options = {
      request,
      symbol,
      counterparty_id,
      expires_in_hrs,
      amount,
      price,
      side,
      nonce,
    };
    const response: NewClearingOrderResponse = {
      result: "AwaitConfirm",
      clearing_id: "0OQGOZXW",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.newClearingOrder({
      counterparty_id,
      expires_in_hrs,
      amount,
      price,
      side,
    });
    deepStrictEqual(data, response);
  });

  test(".newBrokerOrder()", async () => {
    const request = "/v1/clearing/broker/new";
    const source_counterparty_id = "R485E04Q";
    const target_counterparty_id = "Z4929ZDY";
    const expires_in_hrs = 1;
    const symbol = "ethusd";
    const amount = 175;
    const price = 200;
    const side = "sell";
    const options = {
      request,
      symbol,
      source_counterparty_id,
      target_counterparty_id,
      expires_in_hrs,
      amount,
      price,
      side,
      nonce,
    };
    const response: NewClearingOrderResponse = {
      result: "AwaitConfirm",
      clearing_id: "0OQGOZXW",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.newBrokerOrder({
      source_counterparty_id,
      target_counterparty_id,
      expires_in_hrs,
      amount,
      price,
      side,
      symbol,
    });
    deepStrictEqual(data, response);
  });

  test(".newBrokerOrder() (with no `symbol`)", async () => {
    const request = "/v1/clearing/broker/new";
    const source_counterparty_id = "R485E04Q";
    const target_counterparty_id = "Z4929ZDY";
    const expires_in_hrs = 1;
    const symbol = DefaultSymbol;
    const amount = 175;
    const price = 200;
    const side = "sell";
    const options = {
      request,
      symbol,
      source_counterparty_id,
      target_counterparty_id,
      expires_in_hrs,
      amount,
      price,
      side,
      nonce,
    };
    const response: NewClearingOrderResponse = {
      result: "AwaitConfirm",
      clearing_id: "0OQGOZXW",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.newBrokerOrder({
      source_counterparty_id,
      target_counterparty_id,
      expires_in_hrs,
      amount,
      price,
      side,
    });
    deepStrictEqual(data, response);
  });

  test(".getClearingOrderStatus()", async () => {
    const request = "/v1/clearing/status";
    const clearing_id = "OM9VNL1G";
    const options = { request, clearing_id, nonce };
    const response: ClearingOrderStatus = {
      result: "ok",
      status: "AwaitTargetConfirm",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getClearingOrderStatus({ clearing_id });
    deepStrictEqual(data, response);
  });

  test(".cancelClearingOrder()", async () => {
    const request = "/v1/clearing/cancel";
    const clearing_id = "OM9VNL1G";
    const options = { request, clearing_id, nonce };
    const response: CancelClearingOrderResponse = {
      result: "ok",
      details: "P0521QDV order canceled",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.cancelClearingOrder({ clearing_id });
    deepStrictEqual(data, response);
  });

  test(".confirmClearingOrder()", async () => {
    const request = "/v1/clearing/confirm";
    const symbol = "ethusd";
    const clearing_id = "OM9VNL1G";
    const amount = 100;
    const price = 200;
    const side = "buy";
    const options = {
      request,
      symbol,
      amount,
      price,
      side,
      clearing_id,
      nonce,
    };
    const response: ConfirmClearingOptionsResponse = {
      result: "confirmed",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.confirmClearingOrder({
      amount,
      price,
      side,
      clearing_id,
      symbol,
    });
    deepStrictEqual(data, response);
  });

  test(".confirmClearingOrder() (with no `symbol`)", async () => {
    const request = "/v1/clearing/confirm";
    const symbol = DefaultSymbol;
    const clearing_id = "OM9VNL1G";
    const amount = 100;
    const price = 200;
    const side = "buy";
    const options = {
      request,
      symbol,
      amount,
      price,
      side,
      clearing_id,
      nonce,
    };
    const response: ConfirmClearingOptionsResponse = {
      result: "confirmed",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.confirmClearingOrder({
      amount,
      price,
      side,
      clearing_id,
    });
    deepStrictEqual(data, response);
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
        availableForWithdrawal: "1129.10517279",
      },
      {
        type: "exchange",
        currency: "USD",
        amount: "18722.79",
        available: "14481.62",
        availableForWithdrawal: "14481.62",
      },
      {
        type: "exchange",
        currency: "ETH",
        amount: "20124.50369697",
        available: "20124.50369697",
        availableForWithdrawal: "20124.50369697",
      },
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getAvailableBalances({ account });
    deepStrictEqual(data, response);
  });

  test(".getNotionalBalances()", async () => {
    const request = "/v1/notionalbalances/usd";
    const account = "primary";
    const options = { request, account, nonce };
    const response: NotionalBalance[] = [
      {
        currency: "USD",
        amount: "2.911176035",
        amountNotional: "2.911176035",
        available: "2.911176035",
        availableNotional: "2.911176035",
        availableForWithdrawal: "2.91",
        availableForWithdrawalNotional: "2.91",
      },
      {
        currency: "ETH",
        amount: "0.53",
        amountNotional: "69.9759",
        available: "0.523",
        availableNotional: "69.05169",
        availableForWithdrawal: "0.523",
        availableForWithdrawalNotional: "69.05169",
      },
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getNotionalBalances({ account });
    deepStrictEqual(data, response);
  });

  test(".getTransfers()", async () => {
    const request = "/v1/transfers";
    const account = "primary";
    const timestamp = 1;
    const limit_transfers = 10;
    const options = {
      request,
      limit_transfers,
      timestamp,
      account,
      nonce,
    };
    const response: Transfer[] = [
      {
        type: "Deposit",
        status: "Advanced",
        timestampms: 1507913541275,
        eid: 320013281,
        currency: "USD",
        amount: "36.00",
        method: "ACH",
      },
      {
        type: "Deposit",
        status: "Advanced",
        timestampms: 1499990797452,
        eid: 309356152,
        currency: "ETH",
        amount: "100",
        txHash:
          "605c5fa8bf99458d24d61e09941bc443ddc44839d9aaa508b14b296c0c8269b2",
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
        outputIdx: 0,
      },
      {
        type: "Deposit",
        status: "Advanced",
        timestampms: 1458862076082,
        eid: 265799530,
        currency: "USD",
        amount: "500.00",
        method: "ACH",
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
        destination: "mqjvCtt4TJfQaC7nUgLMvHwuDPXMTEUGqx",
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
        destination: "0xd24400ae8BfEBb18cA49Be86258a3C749cf46853",
      },
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getTransfers({
      limit_transfers,
      timestamp,
      account,
    });
    deepStrictEqual(data, response);
  });

  test(".getDepositAddresses()", async () => {
    const network = "bitcoin";
    const request = `/v1/addresses/${network}`;
    const account = "primary";
    const options = { request, account, nonce };
    const response: DepositAddress[] = [
      {
        address: "1KA8QNcgdcVERrAaKF1puKndB7Q7MMg5PR",
        timestamp: 1575304806373,
      },
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getDepositAddresses({ network, account });
    deepStrictEqual(data, response);
  });

  test(".getNewAddress()", async () => {
    const currency = "LTC";
    const request = `/v1/deposit/${currency}/newAddress`;
    const label = "New deposit address";
    const legacy = false;
    const account = "primary";
    const options = { request, label, legacy, account, nonce };
    const response: NewAddress = {
      currency,
      address: "ltc1qdmx34geqhrnmgldcqkr79wwl3yxldsvhhz7t49",
      label,
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getNewAddress({
      currency,
      label,
      legacy,
      account,
    });
    deepStrictEqual(data, response);
  });

  test(".withdrawCrypto()", async () => {
    const currency = "btc";
    const request = `/v1/withdraw/${currency}`;
    const address = "1KA8QNcgdcVERrAaKF1puKndB7Q7MMg5PR";
    const amount = 1;
    const account = "primary";
    const options = { request, address, amount, account, nonce };
    const response: Withdrawal = {
      address: "1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen",
      amount: "1",
      withdrawalId: "02176a83-a6b1-4202-9b85-1c1c92dd25c4",
      message:
        "You have requested a transfer of 1 BTC to 1EdWhc4RiYqrnSVrdNrbkJ2RYaXd9EfEen. This withdrawal will be sent to the blockchain within the next 60 seconds.",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.withdrawCrypto({
      currency,
      address,
      amount,
      account,
    });
    deepStrictEqual(data, response);
  });

  test(".internalTransfer()", async () => {
    const currency = "btc";
    const request = `/v1/account/transfer/${currency}`;
    const sourceAccount = "my-account";
    const targetAccount = "my-other-account";
    const amount = 1;
    const options = {
      request,
      sourceAccount,
      targetAccount,
      amount,
      nonce,
    };
    const response: InternalTransferResponse = {
      uuid: "9c153d64-83ba-4532-a159-ebe3f6797766",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.internalTransfer({
      currency,
      sourceAccount,
      targetAccount,
      amount,
    });
    deepStrictEqual(data, response);
  });

  test(".createAccount()", async () => {
    const request = "/v1/account/create";
    const name = "name";
    const type = "custody";
    const options = { request, name, type, nonce };
    const response: Account = { name, type };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.createAccount({ name, type });
    deepStrictEqual(data, response);
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
        created: 1494204114215,
      },
      {
        name: "test1",
        account: "test1",
        type: "custody",
        counterparty_id: "counterparty_id2",
        created: 1575291112811,
      },
      {
        name: "test2",
        account: "test2",
        type: "exchange",
        counterparty_id: "counterparty_id3",
        created: 1575293113336,
      },
    ];
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.getAccounts();
    deepStrictEqual(data, response);
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
      txHash:
        "6b74434ce7b12360e8c2f0321a9d6302d13beff4d707933a943a6aa267267c93",
    };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.withdrawGUSD({
      address,
      amount,
      account,
    });
    deepStrictEqual(data, response);
  });

  test(".heartbeat()", async () => {
    const request = "/v1/heartbeat";
    const options = { request, nonce };
    const response: Heartbeat = { result: "ok" };
    const payload = Buffer.from(JSON.stringify(options)).toString("base64");

    nock(ApiUri, { reqheaders: { ...SignRequest({ key, secret, payload }) } })
      .post(request)
      .reply(200, response);

    const data = await client.heartbeat();
    deepStrictEqual(data, response);
  });

  test(".nonce()", () => {
    const otherClient = new AuthenticatedClient({ key, secret });
    const otherNonce = otherClient.nonce();
    deepStrictEqual(typeof otherNonce, "number");
  });
});
