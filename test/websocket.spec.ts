import * as assert from "assert";
import { stringify } from "querystring";
import {
  WebsocketClient,
  WsUri,
  SandboxWsUri,
  DefaultSymbol,
  Subscriptions
} from "../index";
import { WSS } from "./lib/wss";
const key = "Gemini-API-KEY";
const secret = "Gemini-API-SECRET";

const symbol = "zecbtc";
const port = 30000;
const wsUri = "ws://localhost:" + port;

suite("WebsocketClient", () => {
  test("constructor", () => {
    const client = new WebsocketClient({ key, secret });
    assert.deepStrictEqual(client.wsUri, WsUri);
    assert.deepStrictEqual(client.symbol, DefaultSymbol);
    assert.deepStrictEqual(client.key, key);
    assert.deepStrictEqual(client.secret, secret);
  });

  test("constructor (with sandbox flag)", () => {
    const client = new WebsocketClient({ sandbox: true, key, symbol });
    assert.deepStrictEqual(client.wsUri, SandboxWsUri);
    assert.deepStrictEqual(client.symbol, symbol);
    assert.deepStrictEqual(client.key, undefined);
    assert.deepStrictEqual(client.secret, undefined);
  });

  test("constructor (with `wsUri`)", () => {
    const client = new WebsocketClient({ key, secret, wsUri });
    assert.deepStrictEqual(client.wsUri, wsUri);
    assert.deepStrictEqual(client.symbol, DefaultSymbol);
    assert.deepStrictEqual(client.key, key);
    assert.deepStrictEqual(client.secret, secret);
  });

  test(".connectMarket()", done => {
    const wss = WSS({ port });
    const client = new WebsocketClient({ wsUri });
    const queryParams = { heartbeat: true, bids: true };
    wss.on("connection", (socket, req) => {
      if (req.url && socket) {
        const [, search] = req.url.split("?");
        assert.deepStrictEqual(search, stringify(queryParams));
      } else {
        assert.fail("Bad url");
      }
    });
    client.connectMarket({ symbol, ...queryParams });
    client.once("open", market => {
      assert.deepStrictEqual(market, symbol);
      wss.close(done);
    });
  });

  test(".connectMarket() (connects to different markets)", done => {
    const wss = WSS({ port });
    const heartbeat = true;
    const _symbol = "btcusd";
    const client = new WebsocketClient({ wsUri, symbol });
    client.connectMarket({ symbol: _symbol });
    client.once("open", market => {
      assert.deepStrictEqual(market, _symbol);
      client.connectMarket({ heartbeat });
      client.once("open", market => {
        assert.deepStrictEqual(market, symbol);
        wss.close(done);
      });
    });
  });

  test(".disconnectMarket()", done => {
    const wss = WSS({ port });
    const client = new WebsocketClient({ wsUri });
    client.connectMarket({ symbol });
    client.once("close", market => {
      assert.deepStrictEqual(market, symbol);
      wss.close(done);
    });
    client.once("open", market => {
      assert.deepStrictEqual(market, symbol);
      client.disconnectMarket({ symbol });
    });
  });

  test(".connectOrders()", done => {
    const wss = WSS({ port, key, secret });
    const client = new WebsocketClient({ wsUri, key, secret });
    client.connectOrders();
    client.once("open", market => {
      assert.deepStrictEqual(market, "orders");
      wss.close(done);
    });
  });

  test(".disconnectOrders()", done => {
    const wss = WSS({ port, key, secret });
    const client = new WebsocketClient({ wsUri, key, secret });
    client.connectOrders();
    client.once("close", market => {
      assert.deepStrictEqual(market, "orders");
      wss.close(done);
    });
    client.once("open", market => {
      assert.deepStrictEqual(market, "orders");
      client.disconnectOrders();
    });
  });

  test(".connect()", done => {
    const wss = WSS({ port });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    client.once("open", market => {
      assert.deepStrictEqual(market, "v2");
      wss.close(done);
    });
  });

  test(".disconnect()", done => {
    const wss = WSS({ port });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    client.once("close", market => {
      assert.deepStrictEqual(market, "v2");
      wss.close(done);
    });
    client.once("open", market => {
      assert.deepStrictEqual(market, "v2");
      client.disconnect();
    });
  });

  test(".subscribe()", done => {
    const wss = WSS({ port });
    const subscriptions: Subscriptions = [
      { name: "l2", symbols: ["BTCUSD", "ETHUSD", "ETHBTC"] }
    ];
    const client = new WebsocketClient({ wsUri });
    wss.on("connection", socket => {
      socket.once("message", message => {
        const msg = JSON.parse(message);
        assert.deepStrictEqual(msg, { type: "subscribe", subscriptions });
        wss.close(done);
      });
    });
    client.connect();
    client.once("open", market => {
      assert.deepStrictEqual(market, "v2");
      client.subscribe(subscriptions);
    });
  });

  test(".unsubscribe()", done => {
    const wss = WSS({ port });
    const subscriptions: Subscriptions = [
      { name: "l2", symbols: ["BTCUSD", "ETHUSD", "ETHBTC"] }
    ];
    const client = new WebsocketClient({ wsUri });
    wss.on("connection", socket => {
      socket.once("message", message => {
        const msg = JSON.parse(message);
        assert.deepStrictEqual(msg, { type: "unsubscribe", subscriptions });
        wss.close(done);
      });
    });
    client.connect();
    client.once("open", market => {
      assert.deepStrictEqual(market, "v2");
      client.unsubscribe(subscriptions);
    });
  });
});
