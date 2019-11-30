import * as assert from "assert";
import * as nock from "nock";
import {
  PublicClient,
  ApiUri,
  SandboxApiUri,
  DefaulTimeout,
  DefaultSymbol,
  Headers,
  Ticker,
  Candle,
  OrderBook,
  Trade,
  AuctionInfo,
  AuctionHistory
} from "../index";

const client = new PublicClient();

suite("PublicClient", () => {
  test(".constructor()", () => {
    assert.deepStrictEqual(client._rpoptions, {
      json: true,
      timeout: DefaulTimeout,
      baseUrl: ApiUri,
      headers: Headers
    });
    assert.deepStrictEqual(client.symbol, DefaultSymbol);
  });

  test(".constructor() (with sandbox flag)", () => {
    const client = new PublicClient({ sandbox: true });
    assert.deepStrictEqual(client._rpoptions, {
      json: true,
      timeout: DefaulTimeout,
      baseUrl: SandboxApiUri,
      headers: Headers
    });
    assert.deepStrictEqual(client.symbol, DefaultSymbol);
  });

  test(".constructor() (with custom options)", () => {
    const sandbox = true;
    const apiUri = "https://new-gemini-api-uri.com";
    const timeout = 9000;
    const symbol = "zecbtc";
    const client = new PublicClient({ sandbox, apiUri, timeout, symbol });
    assert.deepStrictEqual(client._rpoptions, {
      json: true,
      timeout,
      baseUrl: apiUri,
      headers: Headers
    });
    assert.deepStrictEqual(client.symbol, symbol);
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
      "zecltc"
    ];
    nock(ApiUri)
      .get(uri)
      .reply(200, response);

    const data = await client.getSymbols();
    assert.deepStrictEqual(data, response);
  });

  test(".getTicker()", async () => {
    const symbol = "btcusd";
    const uri = "/v1/pubticker/" + symbol;
    const response: Ticker = {
      ask: "977.59",
      bid: "977.35",
      last: "977.65",
      volume: {
        BTC: "2210.505328803",
        USD: "2135477.463379586263",
        timestamp: 1483018200000
      }
    };
    nock(ApiUri)
      .get(uri)
      .reply(200, response);

    const data = await client.getTicker({ symbol });
    assert.deepStrictEqual(data, response);
  });

  test(".getTicker() (v2)", async () => {
    const symbol = "btcusd";
    const uri = "/v2/ticker/" + symbol;
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
        "9148.01"
      ],
      bid: "9345.70",
      ask: "9347.67"
    };
    nock(ApiUri)
      .get(uri)
      .reply(200, response);

    const data = await client.getTicker({ symbol, v: "v2" });
    assert.deepStrictEqual(data, response);
  });

  test(".getCandles()", async () => {
    const symbol = "btcusd";
    const time_frame = "5m";
    const uri = "/v2/candles/" + symbol + "/" + time_frame;
    const response: Candle[] = [
      [1559755800000, 7781.6, 7820.23, 7776.56, 7819.39, 34.7624802159],
      [1559755800000, 7781.6, 7829.46, 7776.56, 7817.28, 43.4228281059]
    ];
    nock(ApiUri)
      .get(uri)
      .reply(200, response);

    const data = await client.getCandles({ symbol, time_frame });
    assert.deepStrictEqual(data, response);
  });

  test(".getOrderBook()", async () => {
    const symbol = "btcusd";
    const uri = "/v1/book/" + symbol;
    const limit_bids = 1;
    const limit_asks = 1;
    const response: OrderBook = {
      bids: [
        {
          price: "3607.85",
          amount: "6.643373",
          timestamp: "1547147541"
        }
      ],
      asks: [
        {
          price: "3607.86",
          amount: "14.68205084",
          timestamp: "1547147541"
        }
      ]
    };
    nock(ApiUri)
      .get(uri)
      .query({ limit_asks, limit_bids })
      .reply(200, response);

    const data = await client.getOrderBook({ symbol, limit_bids, limit_asks });
    assert.deepStrictEqual(data, response);
  });

  test(".getTradeHistory()", async () => {
    const symbol = "btcusd";
    const uri = "/v1/trades/" + symbol;
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
        type: "buy"
      }
    ];
    nock(ApiUri)
      .get(uri)
      .query({ limit_trades, include_breaks, timestamp })
      .reply(200, response);

    const data = await client.getTradeHistory({
      symbol,
      limit_trades,
      include_breaks,
      timestamp
    });
    assert.deepStrictEqual(data, response);
  });

  test(".getCurrentAuction()", async () => {
    const symbol = "btcusd";
    const uri = "/v1/auction/" + symbol;
    const response: AuctionInfo = {
      last_auction_eid: 109929,
      last_auction_price: "629.92",
      last_auction_quantity: "430.12917506",
      last_highest_bid_price: "630.10",
      last_lowest_ask_price: "632.44",
      last_collar_price: "631.27",
      next_auction_ms: 1474567782895,
      next_update_ms: 1474567662895
    };
    nock(ApiUri)
      .get(uri)
      .reply(200, response);

    const data = await client.getCurrentAuction({ symbol });
    assert.deepStrictEqual(data, response);
  });

  test(".getAuctionHistory()", async () => {
    const symbol = "btcusd";
    const uri = "/v1/auction/" + symbol + "/history";
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
        event_type: "auction"
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
        event_type: "indicative"
      }
    ];
    nock(ApiUri)
      .get(uri)
      .query({ limit_auction_results, include_indicative, timestamp })
      .reply(200, response);

    const data = await client.getAuctionHistory({
      symbol,
      limit_auction_results,
      include_indicative,
      timestamp
    });
    assert.deepStrictEqual(data, response);
  });
});
