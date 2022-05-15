import { deepStrictEqual, fail, ok, rejects } from "node:assert";
import { Server } from "node:http";
import nock from "nock";
import { FetchError } from "node-fetch";
import {
  ApiLimit,
  PublicClient,
  ApiUri,
  SandboxApiUri,
  DefaultSymbol,
  Ticker,
  Candle,
  OrderBook,
  Trade,
  AuctionInfo,
  AuctionHistory,
  PriceFeedItem,
} from "../index.js";

const client = new PublicClient();

suite("PublicClient", () => {
  test(".constructor()", () => {
    deepStrictEqual(client.apiUri, ApiUri);
    deepStrictEqual(client.symbol, DefaultSymbol);
  });

  test(".constructor() (with sandbox flag)", () => {
    const otherClient = new PublicClient({ sandbox: true });
    deepStrictEqual(otherClient.apiUri, SandboxApiUri);
    deepStrictEqual(otherClient.symbol, DefaultSymbol);
  });

  test(".constructor() (with custom apiUri)", () => {
    const sandbox = true;
    const apiUri = "https://new-gemini-api-uri.com";
    const symbol = "zecbtc";
    const otherClient = new PublicClient({ sandbox, apiUri, symbol });
    deepStrictEqual(otherClient.apiUri, apiUri);
    deepStrictEqual(otherClient.symbol, symbol);
  });

  test(".get() (reject non 2xx responses)", async () => {
    const uri = "/v1/symbols";
    const response = {
      result: "error",
      reason: "RateLimit",
      message: "Requests were made too frequently",
    };
    nock(ApiUri).get(uri).delay(1).reply(429, response);

    await rejects(client.get(uri), new Error(response.message));
  });

  test(".get() (reject non 2xx responses when no message is provided) ", async () => {
    const uri = "/v1/symbols";
    const response = { result: "error", reason: "RateLimit" };
    nock(ApiUri).get(uri).delay(1).reply(429, response);

    await rejects(client.get(uri), new Error(response.reason));
  });

  test(".get() (reject non 2xx responses with invalid JSON response) ", async () => {
    const uri = "/v1/symbols";
    const response = "Not valid JSON";
    nock(ApiUri).get(uri).delay(1).reply(429, response);

    await rejects(
      client.get(uri),
      new SyntaxError("Unexpected token N in JSON at position 0")
    );
  });

  test(".get() (reject on errors)", async () => {
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

    const otherClient = new PublicClient({ apiUri });
    const uri = "/v1/symbols";
    try {
      await otherClient.get(uri);
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

  test(".getSymbols()", async () => {
    const uri = "/v1/symbols";
    const response = [
      "btcusd",
      "ethbtc",
      "ethusd",
      "bchusd",
      "bchbtc",
      "bcheth",
      "ltcusd",
      "ltcbtc",
      "ltceth",
      "ltcbch",
      "zecusd",
      "zecbtc",
      "zeceth",
      "zecbch",
      "zecltc",
    ];
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getSymbols();
    deepStrictEqual(data, response);
  });

  test(".getSymbol()", async () => {
    const symbol = "ZECLTC";
    const uri = `/v1/symbols/details/${symbol}`;
    const response = {
      symbol: "ZECLTC",
      base_currency: "ZEC",
      quote_currency: "LTC",
      tick_size: 3,
      quote_increment: 6,
      min_order_size: "0.001",
      status: "open",
    };
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getSymbol({ symbol });
    deepStrictEqual(data, response);
  });

  test(".getTicker()", async () => {
    const symbol = "btcusd";
    const uri = `/v1/pubticker/${symbol}`;
    const response: Ticker = {
      ask: "977.59",
      bid: "977.35",
      last: "977.65",
      volume: {
        BTC: "2210.505328803",
        USD: "2135477.463379586263",
        timestamp: 1483018200000,
      },
    };
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getTicker({ symbol });
    deepStrictEqual(data, response);
  });

  test(".getTicker() (with no `symbol`)", async () => {
    const symbol = DefaultSymbol;
    const uri = `/v1/pubticker/${symbol}`;
    const response: Ticker = {
      ask: "977.59",
      bid: "977.35",
      last: "977.65",
      volume: {
        BTC: "2210.505328803",
        USD: "2135477.463379586263",
        timestamp: 1483018200000,
      },
    };
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getTicker({});
    deepStrictEqual(data, response);
  });

  test(".getTicker() (v2)", async () => {
    const symbol = "btcusd";
    const uri = `/v2/ticker/${symbol}`;
    const response: Ticker = {
      symbol: "BTCUSD",
      open: "9121.76",
      high: "9440.66",
      low: "9106.51",
      close: "9347.66",
      changes: [
        "9365.1",
        "9386.16",
        "9373.41",
        "9322.56",
        "9268.89",
        "9265.38",
        "9245",
        "9231.43",
        "9235.88",
        "9265.8",
        "9295.18",
        "9295.47",
        "9310.82",
        "9335.38",
        "9344.03",
        "9261.09",
        "9265.18",
        "9282.65",
        "9260.01",
        "9225",
        "9159.5",
        "9150.81",
        "9118.6",
        "9148.01",
      ],
      bid: "9345.70",
      ask: "9347.67",
    };
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getTicker({ symbol, v: "v2" });
    deepStrictEqual(data, response);
  });

  test(".getTicker() (with no arguments)", async () => {
    const symbol = DefaultSymbol;
    const uri = `/v1/pubticker/${symbol}`;
    const response: Ticker = {
      ask: "977.59",
      bid: "977.35",
      last: "977.65",
      volume: {
        BTC: "2210.505328803",
        USD: "2135477.463379586263",
        timestamp: 1483018200000,
      },
    };
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getTicker();
    deepStrictEqual(data, response);
  });

  test(".getCandles()", async () => {
    const symbol = "btcusd";
    const time_frame = "5m";
    const uri = `/v2/candles/${symbol}/${time_frame}`;
    const response: Candle[] = [
      [1559755800000, 7781.6, 7820.23, 7776.56, 7819.39, 34.7624802159],
      [1559755800000, 7781.6, 7829.46, 7776.56, 7817.28, 43.4228281059],
    ];
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getCandles({ symbol, time_frame });
    deepStrictEqual(data, response);
  });

  test(".getCandles() (with no `symbol`)", async () => {
    const symbol = DefaultSymbol;
    const time_frame = "5m";
    const uri = `/v2/candles/${symbol}/${time_frame}`;
    const response: Candle[] = [
      [1559755800000, 7781.6, 7820.23, 7776.56, 7819.39, 34.7624802159],
      [1559755800000, 7781.6, 7829.46, 7776.56, 7817.28, 43.4228281059],
    ];
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getCandles({ time_frame });
    deepStrictEqual(data, response);
  });

  test(".getCandles() (with no `time_frame`)", async () => {
    const symbol = "btcusd";
    const time_frame = "1day";
    const uri = `/v2/candles/${symbol}/${time_frame}`;
    const response: Candle[] = [
      [1559755800000, 7781.6, 7820.23, 7776.56, 7819.39, 34.7624802159],
      [1559755800000, 7781.6, 7829.46, 7776.56, 7817.28, 43.4228281059],
    ];
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getCandles({ symbol });
    deepStrictEqual(data, response);
  });

  test(".getCandles() (with no arguments)", async () => {
    const symbol = DefaultSymbol;
    const time_frame = "1day";
    const uri = `/v2/candles/${symbol}/${time_frame}`;
    const response: Candle[] = [
      [1559755800000, 7781.6, 7820.23, 7776.56, 7819.39, 34.7624802159],
      [1559755800000, 7781.6, 7829.46, 7776.56, 7817.28, 43.4228281059],
    ];
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getCandles();
    deepStrictEqual(data, response);
  });

  test(".getOrderBook()", async () => {
    const symbol = "btcusd";
    const uri = `/v1/book/${symbol}`;
    const limit_bids = 1;
    const limit_asks = 1;
    const response: OrderBook = {
      bids: [
        {
          price: "3607.85",
          amount: "6.643373",
          timestamp: "1547147541",
        },
      ],
      asks: [
        {
          price: "3607.86",
          amount: "14.68205084",
          timestamp: "1547147541",
        },
      ],
    };
    nock(ApiUri)
      .get(uri)
      .query({ limit_asks, limit_bids })
      .reply(200, response);

    const data = await client.getOrderBook({ symbol, limit_bids, limit_asks });
    deepStrictEqual(data, response);
  });

  test(".getOrderBook() (with no `symbol`)", async () => {
    const symbol = DefaultSymbol;
    const uri = `/v1/book/${symbol}`;
    const limit_bids = 1;
    let limit_asks: undefined;
    const response: OrderBook = {
      bids: [
        {
          price: "3607.85",
          amount: "6.643373",
          timestamp: "1547147541",
        },
      ],
      asks: [
        {
          price: "3607.86",
          amount: "14.68205084",
          timestamp: "1547147541",
        },
      ],
    };
    nock(ApiUri).get(uri).query({ limit_bids }).reply(200, response);

    const data = await client.getOrderBook({ limit_bids, limit_asks });
    deepStrictEqual(data, response);
  });

  test(".getOrderBook() (with no arguments)", async () => {
    const symbol = DefaultSymbol;
    const uri = `/v1/book/${symbol}`;
    const response: OrderBook = {
      bids: [
        {
          price: "3607.85",
          amount: "6.643373",
          timestamp: "1547147541",
        },
      ],
      asks: [
        {
          price: "3607.86",
          amount: "14.68205084",
          timestamp: "1547147541",
        },
      ],
    };
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getOrderBook();
    deepStrictEqual(data, response);
  });

  test(".getTradeHistory()", async () => {
    const symbol = "btcusd";
    const uri = `/v1/trades/${symbol}`;
    const limit_trades = 1;
    const include_breaks = true;
    const timestamp = 2;
    const response: Trade[] = [
      {
        timestamp: 1547146811,
        timestampms: 1547146811357,
        tid: 5335307668,
        price: "3610.85",
        amount: "0.27413495",
        exchange: "gemini",
        type: "buy",
      },
    ];
    nock(ApiUri)
      .get(uri)
      .query({ limit_trades, include_breaks, timestamp })
      .reply(200, response);

    const data = await client.getTradeHistory({
      symbol,
      limit_trades,
      include_breaks,
      timestamp,
    });
    deepStrictEqual(data, response);
  });

  test(".getTradeHistory() (with no `symbol`)", async () => {
    const symbol = DefaultSymbol;
    const uri = `/v1/trades/${symbol}`;
    const limit_trades = 1;
    const include_breaks = true;
    const timestamp = 2;
    const response: Trade[] = [
      {
        timestamp: 1547146811,
        timestampms: 1547146811357,
        tid: 5335307668,
        price: "3610.85",
        amount: "0.27413495",
        exchange: "gemini",
        type: "buy",
      },
    ];
    nock(ApiUri)
      .get(uri)
      .query({ limit_trades, include_breaks, timestamp })
      .reply(200, response);

    const data = await client.getTradeHistory({
      limit_trades,
      include_breaks,
      timestamp,
    });
    deepStrictEqual(data, response);
  });

  test(".getTradeHistory() (with no `limit_trades`)", async () => {
    const symbol = "btcusd";
    const uri = `/v1/trades/${symbol}`;
    const limit_trades = ApiLimit;
    const include_breaks = true;
    const timestamp = 2;
    const response: Trade[] = [
      {
        timestamp: 1547146811,
        timestampms: 1547146811357,
        tid: 5335307668,
        price: "3610.85",
        amount: "0.27413495",
        exchange: "gemini",
        type: "buy",
      },
    ];
    nock(ApiUri)
      .get(uri)
      .query({ limit_trades, include_breaks, timestamp })
      .reply(200, response);

    const data = await client.getTradeHistory({
      symbol,
      include_breaks,
      timestamp,
    });
    deepStrictEqual(data, response);
  });

  test(".getTradeHistory() (with no arguments)", async () => {
    const symbol = DefaultSymbol;
    const uri = `/v1/trades/${symbol}`;
    const limit_trades = ApiLimit;
    const response: Trade[] = [
      {
        timestamp: 1547146811,
        timestampms: 1547146811357,
        tid: 5335307668,
        price: "3610.85",
        amount: "0.27413495",
        exchange: "gemini",
        type: "buy",
      },
    ];
    nock(ApiUri).get(uri).query({ limit_trades }).reply(200, response);

    const data = await client.getTradeHistory();
    deepStrictEqual(data, response);
  });

  test(".getCurrentAuction()", async () => {
    const symbol = "btcusd";
    const uri = `/v1/auction/${symbol}`;
    const response: AuctionInfo = {
      last_auction_eid: 109929,
      last_auction_price: "629.92",
      last_auction_quantity: "430.12917506",
      last_highest_bid_price: "630.10",
      last_lowest_ask_price: "632.44",
      last_collar_price: "631.27",
      next_auction_ms: 1474567782895,
      next_update_ms: 1474567662895,
    };
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getCurrentAuction({ symbol });
    deepStrictEqual(data, response);
  });

  test(".getCurrentAuction() (with no `symbol`)", async () => {
    const symbol = DefaultSymbol;
    const uri = `/v1/auction/${symbol}`;
    const response: AuctionInfo = {
      last_auction_eid: 109929,
      last_auction_price: "629.92",
      last_auction_quantity: "430.12917506",
      last_highest_bid_price: "630.10",
      last_lowest_ask_price: "632.44",
      last_collar_price: "631.27",
      next_auction_ms: 1474567782895,
      next_update_ms: 1474567662895,
    };
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getCurrentAuction({});
    deepStrictEqual(data, response);
  });

  test(".getCurrentAuction() (with no arguments)", async () => {
    const symbol = DefaultSymbol;
    const uri = `/v1/auction/${symbol}`;
    const response: AuctionInfo = {
      last_auction_eid: 109929,
      last_auction_price: "629.92",
      last_auction_quantity: "430.12917506",
      last_highest_bid_price: "630.10",
      last_lowest_ask_price: "632.44",
      last_collar_price: "631.27",
      next_auction_ms: 1474567782895,
      next_update_ms: 1474567662895,
    };
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getCurrentAuction();
    deepStrictEqual(data, response);
  });

  test(".getAuctionHistory()", async () => {
    const symbol = "btcusd";
    const uri = `/v1/auction/${symbol}/history`;
    const limit_auction_results = 2;
    const include_indicative = true;
    const timestamp = 2;
    const response: AuctionHistory[] = [
      {
        auction_id: 3,
        auction_price: "628.775",
        auction_quantity: "66.32225622",
        eid: 4066,
        highest_bid_price: "628.82",
        lowest_ask_price: "629.48",
        collar_price: "629.15",
        auction_result: "success",
        timestamp: 1471902531,
        timestampms: 1471902531225,
        event_type: "auction",
      },
      {
        auction_id: 3,
        auction_price: "628.865",
        auction_quantity: "89.22776435",
        eid: 3920,
        highest_bid_price: "629.59",
        lowest_ask_price: "629.77",
        collar_price: "629.68",
        auction_result: "success",
        timestamp: 1471902471,
        timestampms: 1471902471225,
        event_type: "indicative",
      },
    ];
    nock(ApiUri)
      .get(uri)
      .query({ limit_auction_results, include_indicative, timestamp })
      .reply(200, response);

    const data = await client.getAuctionHistory({
      symbol,
      limit_auction_results,
      include_indicative,
      timestamp,
    });
    deepStrictEqual(data, response);
  });

  test(".getAuctionHistory() (with no `symbol`)", async () => {
    const symbol = DefaultSymbol;
    const uri = `/v1/auction/${symbol}/history`;
    const limit_auction_results = 2;
    const include_indicative = true;
    const timestamp = 2;
    const response: AuctionHistory[] = [
      {
        auction_id: 3,
        auction_price: "628.775",
        auction_quantity: "66.32225622",
        eid: 4066,
        highest_bid_price: "628.82",
        lowest_ask_price: "629.48",
        collar_price: "629.15",
        auction_result: "success",
        timestamp: 1471902531,
        timestampms: 1471902531225,
        event_type: "auction",
      },
      {
        auction_id: 3,
        auction_price: "628.865",
        auction_quantity: "89.22776435",
        eid: 3920,
        highest_bid_price: "629.59",
        lowest_ask_price: "629.77",
        collar_price: "629.68",
        auction_result: "success",
        timestamp: 1471902471,
        timestampms: 1471902471225,
        event_type: "indicative",
      },
    ];
    nock(ApiUri)
      .get(uri)
      .query({ limit_auction_results, include_indicative, timestamp })
      .reply(200, response);

    const data = await client.getAuctionHistory({
      limit_auction_results,
      include_indicative,
      timestamp,
    });
    deepStrictEqual(data, response);
  });

  test(".getAuctionHistory() (with no `limit_auction_results`)", async () => {
    const symbol = "btcusd";
    const uri = `/v1/auction/${symbol}/history`;
    const limit_auction_results = ApiLimit;
    const include_indicative = true;
    const timestamp = 2;
    const response: AuctionHistory[] = [
      {
        auction_id: 3,
        auction_price: "628.775",
        auction_quantity: "66.32225622",
        eid: 4066,
        highest_bid_price: "628.82",
        lowest_ask_price: "629.48",
        collar_price: "629.15",
        auction_result: "success",
        timestamp: 1471902531,
        timestampms: 1471902531225,
        event_type: "auction",
      },
      {
        auction_id: 3,
        auction_price: "628.865",
        auction_quantity: "89.22776435",
        eid: 3920,
        highest_bid_price: "629.59",
        lowest_ask_price: "629.77",
        collar_price: "629.68",
        auction_result: "success",
        timestamp: 1471902471,
        timestampms: 1471902471225,
        event_type: "indicative",
      },
    ];
    nock(ApiUri)
      .get(uri)
      .query({ limit_auction_results, include_indicative, timestamp })
      .reply(200, response);

    const data = await client.getAuctionHistory({
      symbol,
      include_indicative,
      timestamp,
    });
    deepStrictEqual(data, response);
  });

  test(".getAuctionHistory() (with no arguments)", async () => {
    const symbol = DefaultSymbol;
    const uri = `/v1/auction/${symbol}/history`;
    const limit_auction_results = ApiLimit;
    const response: AuctionHistory[] = [
      {
        auction_id: 3,
        auction_price: "628.775",
        auction_quantity: "66.32225622",
        eid: 4066,
        highest_bid_price: "628.82",
        lowest_ask_price: "629.48",
        collar_price: "629.15",
        auction_result: "success",
        timestamp: 1471902531,
        timestampms: 1471902531225,
        event_type: "auction",
      },
      {
        auction_id: 3,
        auction_price: "628.865",
        auction_quantity: "89.22776435",
        eid: 3920,
        highest_bid_price: "629.59",
        lowest_ask_price: "629.77",
        collar_price: "629.68",
        auction_result: "success",
        timestamp: 1471902471,
        timestampms: 1471902471225,
        event_type: "indicative",
      },
    ];
    nock(ApiUri).get(uri).query({ limit_auction_results }).reply(200, response);

    const data = await client.getAuctionHistory();
    deepStrictEqual(data, response);
  });

  test(".getPriceFeed()", async () => {
    const uri = "/v1/pricefeed";
    const response: PriceFeedItem[] = [
      { pair: "LTCETH", price: "0.2905", percentChange24h: "-0.0027" },
      { pair: "LTCBCH", price: "0.1773", percentChange24h: "-0.0599" },
      { pair: "BTCUSD", price: "6198.36", percentChange24h: "-0.0424" },
      { pair: "LTCUSD", price: "38.4", percentChange24h: "-0.0504" },
      { pair: "ZECBTC", price: "0.00526", percentChange24h: "0.0648" },
      { pair: "BCHUSD", price: "217.05", percentChange24h: "-0.0415" },
      { pair: "ZECUSD", price: "33.66", percentChange24h: "0.0457" },
      { pair: "ETHBTC", price: "0.02138", percentChange24h: "-0.0028" },
      { pair: "BCHBTC", price: "0.03509", percentChange24h: "-0.0293" },
      { pair: "ETHUSD", price: "132.63", percentChange24h: "-0.0434" },
      { pair: "ZECBCH", price: "0", percentChange24h: "0.0000" },
      { pair: "ZECETH", price: "0.249", percentChange24h: "0.0600" },
      { pair: "LTCBTC", price: "0.00624", percentChange24h: "-0.0016" },
      { pair: "BCHETH", price: "1.614", percentChange24h: "0.0000" },
      { pair: "ZECLTC", price: "0.861", percentChange24h: "0.0630" },
    ];
    nock(ApiUri).get(uri).reply(200, response);

    const data = await client.getPriceFeed();
    deepStrictEqual(data, response);
  });
});
