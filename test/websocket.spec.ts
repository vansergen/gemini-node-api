import * as assert from "assert";
import { stringify } from "querystring";
import {
  WebsocketClient,
  WsUri,
  SandboxWsUri,
  DefaultSymbol,
  Subscriptions
} from "../index";
import { Server, OPEN, CLOSING, CONNECTING, CLOSED } from "ws";
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

  test("constructor (with no `arguments`)", () => {
    const client = new WebsocketClient();
    assert.deepStrictEqual(client.wsUri, WsUri);
    assert.deepStrictEqual(client.symbol, DefaultSymbol);
    assert.deepStrictEqual(client.key, undefined);
    assert.deepStrictEqual(client.secret, undefined);
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

  test(".connectMarket() (with no arguments)", done => {
    const wss = WSS({ port });
    const symbol = "ethusd";
    const client = new WebsocketClient({ wsUri, symbol });
    client.connectMarket();
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

  test(".disconnectMarket() (with no `symbol`)", done => {
    const wss = WSS({ port });
    const symbol = "ethusd";
    const client = new WebsocketClient({ wsUri, symbol });
    client.once("close", market => {
      assert.deepStrictEqual(market, symbol);
      wss.close(done);
    });
    client.once("open", market => {
      assert.deepStrictEqual(market, symbol);
      client.disconnectMarket({});
    });
    client.connectMarket({});
  });

  test(".disconnectMarket() (with no arguments)", done => {
    const wss = WSS({ port });
    const symbol = "ethusd";
    const client = new WebsocketClient({ wsUri, symbol });
    client.once("close", market => {
      assert.deepStrictEqual(market, symbol);
      wss.close(done);
    });
    client.once("open", market => {
      assert.deepStrictEqual(market, symbol);
      client.disconnectMarket();
    });
    client.connectMarket();
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

  test(".connectOrders() (with no api key)", done => {
    const client = new WebsocketClient({ wsUri, secret });
    const error = new Error("`connectOrders` requires both `key` and `secret`");
    assert.throws(() => client.connectOrders(), error);
    done();
  });

  test(".connectOrders() (with `account`)", done => {
    const wss = new Server({ port });
    const url = "/v1/order/events";
    const nonce = 1;
    const _nonce: () => number = () => nonce;
    const query =
      "eventTypeFilter=initial&eventTypeFilter=fill&eventTypeFilter=closed&symbolFilter=btcusd&symbolFilter=ethbtc&apiSessionFilter=t14phVqvAAJlK4YiXmBM";
    const qs = {
      eventTypeFilter: ["initial", "fill", "closed"],
      symbolFilter: ["btcusd", "ethbtc"],
      apiSessionFilter: ["t14phVqvAAJlK4YiXmBM"]
    };
    const account = "primary";
    wss.on("connection", (ws, req) => {
      assert.deepStrictEqual(req.url, url + "?" + query);
      const providedSignature = req.headers["x-gemini-signature"];
      const providedKey = req.headers["x-gemini-apikey"];
      const providedPayload = req.headers["x-gemini-payload"] as string;
      assert.deepStrictEqual(typeof providedPayload, "string");
      assert.deepStrictEqual(providedKey, key);
      assert.deepStrictEqual(typeof providedSignature, "string");
      const payload: {
        request?: string;
        nonce?: number;
        account: string;
      } = JSON.parse(Buffer.from(providedPayload, "base64").toString());
      assert.deepStrictEqual(payload.request, url);
      assert.deepStrictEqual(payload.nonce, nonce);
      assert.deepStrictEqual(payload.account, account);
      ws.close();
    });
    const client = new WebsocketClient({ wsUri, key, secret });
    client.nonce = _nonce;
    client.connectOrders({ account, ...qs });
    client.once("open", market => assert.deepStrictEqual(market, "orders"));
    client.on("close", market => {
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

  test(".connect() (when `readyState` is OPEN)", done => {
    const wss = WSS({ port });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    client.once("open", market => {
      assert.deepStrictEqual(market, "v2");
      const error = new Error("Could not connect. State: " + OPEN);
      assert.throws(() => client.connect(), error);
      wss.close(done);
    });
  });

  test(".connect() (when `readyState` is CLOSING)", done => {
    const wss = WSS({ port });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    client.once("open", market => {
      assert.deepStrictEqual(market, "v2");
      client.disconnect();
      const error = new Error("Could not connect. State: " + CLOSING);
      assert.throws(() => client.connect(), error);
      wss.close(done);
    });
  });

  test(".connect() (when `readyState` is CONNECTING)", done => {
    const wss = WSS({ port });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    const error = new Error("Could not connect. State: " + CONNECTING);
    assert.throws(() => client.connect(), error);
    client.once("open", () => wss.close(done));
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

  test(".disconnect() (when `socket` is not initialized)", done => {
    const client = new WebsocketClient({ wsUri });
    const error = new Error("Socket was not initialized");
    assert.throws(() => client.disconnect(), error);
    done();
  });

  test(".disconnect() (when `readyState` is CLOSED)", done => {
    const wss = WSS({ port });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    client.once("close", market => {
      assert.deepStrictEqual(market, "v2");
      const error = new Error("Socket state: " + CLOSED);
      assert.throws(() => client.disconnect(), error);
      wss.close(done);
    });
    client.once("open", market => {
      assert.deepStrictEqual(market, "v2");
      client.disconnect();
    });
  });

  test(".disconnect() (when `readyState` is CLOSING)", done => {
    const wss = WSS({ port });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    client.once("open", market => {
      assert.deepStrictEqual(market, "v2");
      client.disconnect();
      const error = new Error("Socket state: " + CLOSING);
      assert.throws(() => client.disconnect(), error);
      wss.close(done);
    });
  });

  test(".disconnect() (when `readyState` is CONNECTING)", done => {
    const wss = WSS({ port });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    const error = new Error("Socket state: " + CONNECTING);
    assert.throws(() => client.disconnect(), error);
    client.on("open", () => wss.close(done));
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

  suite(".socket listeners", () => {
    suite(".onOpen()", () => {
      test("emits `open`", done => {
        const wss = new Server({ port });
        const client = new WebsocketClient({ wsUri });
        client.once("open", market => {
          assert.deepStrictEqual(market, "v2");
          client.once("open", _market => {
            assert.deepStrictEqual(_market, "v2");
            wss.close(done);
          });
          client.sockets["v2"].emit("open");
        });
        client.connect();
      });
    });

    suite(".onClose()", () => {
      test("emits `close`", done => {
        const wss = new Server({ port });
        const client = new WebsocketClient({ wsUri });
        client.once("close", market => {
          assert.deepStrictEqual(market, "v2");
          client.once("close", _market => {
            assert.deepStrictEqual(_market, "v2");
            wss.close(done);
          });
          client.sockets["v2"].emit("close");
        });
        client.once("open", market => {
          assert.deepStrictEqual(market, "v2");
          client.disconnect();
        });
        client.connect();
      });
    });

    suite(".onError()", () => {
      test("emits `error`", done => {
        const wss = new Server({ port });
        const client = new WebsocketClient({ wsUri });
        const error = new Error("Something bad happened");
        client.once("error", (err, market) => {
          assert.deepStrictEqual(market, "v2");
          assert.deepStrictEqual(err, error);
          wss.close(done);
        });
        client.once("open", market => {
          assert.deepStrictEqual(market, "v2");
          client.sockets["v2"].emit("error", error);
        });
        client.connect();
      });

      test("does not emit `error` with no argumets", done => {
        const wss = new Server({ port });
        const client = new WebsocketClient({ wsUri });
        client.once("error", () => assert.fail("Should not emit errors"));
        client.once("open", market => {
          assert.deepStrictEqual(market, "v2");
          client.sockets["v2"].emit("error");
          setTimeout(() => wss.close(done), 10);
        });
        client.connect();
      });
    });

    suite(".onMessage()", () => {
      test("emits `error` on bad JSON", done => {
        const wss = new Server({ port });
        const client = new WebsocketClient({ wsUri });
        wss.on("connection", ws => ws.send("BADJSON!"));
        client.once("error", (error, market) => {
          assert.deepStrictEqual(market, "v2");
          assert.ok(error instanceof SyntaxError);
          wss.close(done);
        });
        client.once("open", market => {
          assert.deepStrictEqual(market, "v2");
        });
        client.connect();
      });

      test("emits `message`", done => {
        const wss = new Server({ port });
        const client = new WebsocketClient({ wsUri });
        const message = {
          type: "candles_15m_updates",
          symbol: "BTCUSD",
          changes: [
            [1561054500000, 9350.18, 9358.35, 9350.18, 9355.51, 2.07],
            [1561053600000, 9357.33, 9357.33, 9350.18, 9350.18, 1.5900161]
          ]
        };
        wss.once("connection", ws => ws.send(JSON.stringify(message)));
        client.once("message", (data, market) => {
          assert.deepStrictEqual(market, "v2");
          assert.deepStrictEqual(data, message);
          wss.close(done);
        });
        client.once("open", market => {
          assert.deepStrictEqual(market, "v2");
        });
        client.connect();
      });
    });
  });
});
