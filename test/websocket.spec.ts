import assert from "assert";
import { stringify } from "querystring";
import { Server, OPEN, CLOSING, CONNECTING, CLOSED } from "ws";
import type { IncomingMessage } from "http";
import {
  WebsocketClient,
  WsUri,
  SandboxWsUri,
  DefaultSymbol,
  Subscriptions,
  AuthHeaders,
  SignRequest,
  WSSignerOptions,
} from "../index";

const key = "Gemini-API-KEY";
const secret = "Gemini-API-SECRET";
const symbol = "zecbtc";
const port = 30000;
const wsUri = `ws://localhost:${port}`;

function VerifySignature(
  request: IncomingMessage,
  _key: string,
  _secret: string
): false | AuthHeaders {
  const providedSignature = request.headers["x-gemini-signature"];
  const providedKey = request.headers["x-gemini-apikey"];
  const providedPayload = request.headers["x-gemini-payload"];
  if (providedKey !== _key || typeof providedSignature !== "string") {
    return false;
  } else if (typeof providedPayload !== "string") {
    return false;
  }
  const { "X-GEMINI-SIGNATURE": signature } = SignRequest({
    key: _key,
    secret: _secret,
    payload: providedPayload,
  });
  if (signature !== providedSignature) {
    return false;
  }
  return {
    "X-GEMINI-APIKEY": _key,
    "X-GEMINI-PAYLOAD": providedPayload,
    "X-GEMINI-SIGNATURE": signature,
  };
}

suite("WebsocketClient", () => {
  let client: WebsocketClient;
  let server: Server;

  setup(async () => {
    await new Promise<void>((resolve) => {
      server = new Server({ port }, resolve);
    });
    client = new WebsocketClient({ wsUri });
  });

  teardown(async () => {
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

  test("constructor", () => {
    const otherClient = new WebsocketClient();

    assert.deepStrictEqual(otherClient.wsUri, WsUri);
    assert.deepStrictEqual(otherClient.symbol, DefaultSymbol);
  });

  test("constructor (with sandbox flag)", () => {
    const otherClient = new WebsocketClient({ sandbox: true, key, symbol });

    assert.deepStrictEqual(otherClient.wsUri, SandboxWsUri);
    assert.deepStrictEqual(otherClient.symbol, symbol);
  });

  test("constructor (with `wsUri`)", () => {
    const otherClient = new WebsocketClient({ key, secret, wsUri });

    assert.deepStrictEqual(otherClient.wsUri, wsUri);
    assert.deepStrictEqual(otherClient.symbol, DefaultSymbol);
  });

  test(".connectMarket()", async () => {
    const queryParams = { heartbeat: true, bids: true };
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          assert.deepStrictEqual(url.search, `?${stringify(queryParams)}`);
          assert.deepStrictEqual(url.hash, "");
          assert.deepStrictEqual(url.pathname, `/v1/marketdata/${symbol}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      client.once("open", (market) => {
        try {
          assert.deepStrictEqual(market, symbol);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await client.connectMarket({ symbol, ...queryParams });
    assert.deepStrictEqual(client.sockets[symbol].readyState, OPEN);
    await clientConnect;
    await serverConnect;
  });

  test(".connectMarket() (with no `symbol`)", async () => {
    const otherClient = new WebsocketClient({ wsUri, symbol });
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          assert.deepStrictEqual(url.search, "");
          assert.deepStrictEqual(url.hash, "");
          assert.deepStrictEqual(url.pathname, `/v1/marketdata/${symbol}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      otherClient.once("open", (market) => {
        try {
          assert.deepStrictEqual(market, symbol);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await otherClient.connectMarket();
    assert.deepStrictEqual(otherClient.sockets[symbol].readyState, OPEN);
    await clientConnect;
    await serverConnect;
  });

  test(".connectMarket() (connects to different markets)", async () => {
    const heartbeat = true;
    const _symbol = "btcusd";
    const otherClient = new WebsocketClient({ wsUri, symbol });
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          assert.deepStrictEqual(url.search, "");
          assert.deepStrictEqual(url.hash, "");
          assert.deepStrictEqual(url.pathname, `/v1/marketdata/${_symbol}`);
          server.once("connection", (__socket, _req) => {
            try {
              const newUrl = new URL(_req.url ?? "", wsUri);
              assert.deepStrictEqual(
                newUrl.search,
                `?${stringify({ heartbeat })}`
              );
              assert.deepStrictEqual(newUrl.hash, "");
              assert.deepStrictEqual(
                newUrl.pathname,
                `/v1/marketdata/${symbol}`
              );
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      otherClient.once("open", (market) => {
        try {
          assert.deepStrictEqual(market, _symbol);
          otherClient.once("open", (otherMarket) => {
            try {
              assert.deepStrictEqual(otherMarket, symbol);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    await otherClient.connectMarket({ symbol: _symbol });
    assert.deepStrictEqual(otherClient.sockets[_symbol].readyState, OPEN);
    await otherClient.connectMarket({ heartbeat });
    assert.deepStrictEqual(otherClient.sockets[symbol].readyState, OPEN);
    await clientConnect;
    await serverConnect;
  });

  test(".disconnectMarket()", async () => {
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          assert.deepStrictEqual(url.search, "");
          assert.deepStrictEqual(url.hash, "");
          assert.deepStrictEqual(url.pathname, `/v1/marketdata/${symbol}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      client.once("open", (market) => {
        try {
          assert.deepStrictEqual(market, symbol);
          client.once("close", (otherMarket) => {
            try {
              assert.deepStrictEqual(otherMarket, symbol);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    await client.connectMarket({ symbol });
    await client.disconnectMarket({ symbol });
    await clientConnect;
    await serverConnect;
  });

  test(".disconnectMarket() (with no `symbol`)", async () => {
    const otherClient = new WebsocketClient({ wsUri, symbol });

    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          assert.deepStrictEqual(url.search, "");
          assert.deepStrictEqual(url.hash, "");
          assert.deepStrictEqual(url.pathname, `/v1/marketdata/${symbol}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      otherClient.once("open", (market) => {
        try {
          assert.deepStrictEqual(market, symbol);
          otherClient.once("close", (otherMarket) => {
            try {
              assert.deepStrictEqual(otherMarket, symbol);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    await otherClient.connectMarket();
    assert.deepStrictEqual(otherClient.sockets[symbol].readyState, OPEN);
    await otherClient.disconnectMarket();
    assert.deepStrictEqual(otherClient.sockets[symbol].readyState, CLOSED);
    await clientConnect;
    await serverConnect;
  });

  test(".connectOrders()", async () => {
    server.options.verifyClient = ({
      req,
    }: {
      req: IncomingMessage;
    }): boolean => (VerifySignature(req, key, secret) ? true : false);
    const otherClient = new WebsocketClient({ wsUri, key, secret });
    const nonce = Date.now();
    const _nonce = (): number => nonce;
    otherClient.nonce = _nonce;
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          const request = "/v1/order/events";
          assert.deepStrictEqual(url.search, "");
          assert.deepStrictEqual(url.hash, "");
          assert.deepStrictEqual(url.pathname, request);
          const verify = VerifySignature(req, key, secret);
          assert.ok(verify);
          const { "X-GEMINI-PAYLOAD": payload } = verify;
          const parsedPayload = JSON.parse(
            Buffer.from(payload, "base64").toString("utf8")
          ) as WSSignerOptions;
          assert.deepStrictEqual(parsedPayload, { request, nonce });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      otherClient.once("open", (market) => {
        try {
          assert.deepStrictEqual(market, "orders");
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await otherClient.connectOrders();
    assert.deepStrictEqual(otherClient.sockets.orders.readyState, OPEN);
    await clientConnect;
    await serverConnect;
    delete server.options.verifyClient;
  });

  test(".connectOrders() (with no api key)", async () => {
    const otherClient = new WebsocketClient({ wsUri, secret });
    const error = new Error("`connectOrders` requires both `key` and `secret`");
    await assert.rejects(otherClient.connectOrders(), error);
  });

  test(".connectOrders() (with `account`)", async () => {
    server.options.verifyClient = ({
      req,
    }: {
      req: IncomingMessage;
    }): boolean => (VerifySignature(req, key, secret) ? true : false);
    const otherClient = new WebsocketClient({ wsUri, key, secret });
    const nonce = Date.now();
    const _nonce = (): number => nonce;
    otherClient.nonce = _nonce;
    const account = "primary";
    const qs = {
      eventTypeFilter: ["initial", "fill", "closed"],
      symbolFilter: ["btcusd", "ethbtc"],
      apiSessionFilter: ["t14phVqvAAJlK4YiXmBM"],
    };
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          const request = "/v1/order/events";
          assert.deepStrictEqual(url.search, `?${stringify(qs)}`);
          assert.deepStrictEqual(url.hash, "");
          assert.deepStrictEqual(url.pathname, request);
          const verify = VerifySignature(req, key, secret);
          assert.ok(verify);
          const { "X-GEMINI-PAYLOAD": payload } = verify;
          const parsedPayload = JSON.parse(
            Buffer.from(payload, "base64").toString("utf8")
          ) as WSSignerOptions;
          assert.deepStrictEqual(parsedPayload, { request, nonce, account });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      otherClient.once("open", (market) => {
        try {
          assert.deepStrictEqual(market, "orders");
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await otherClient.connectOrders({ account, ...qs });
    assert.deepStrictEqual(otherClient.sockets.orders.readyState, OPEN);
    await clientConnect;
    await serverConnect;
    delete server.options.verifyClient;
  });

  test(".disconnectOrders()", async () => {
    server.options.verifyClient = ({
      req,
    }: {
      req: IncomingMessage;
    }): boolean => (VerifySignature(req, key, secret) ? true : false);
    const otherClient = new WebsocketClient({ wsUri, key, secret });
    const clientConnect = new Promise<void>((resolve, reject) => {
      otherClient.once("close", (market) => {
        try {
          assert.deepStrictEqual(market, "orders");
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await otherClient.connectOrders();
    assert.deepStrictEqual(otherClient.sockets.orders.readyState, OPEN);
    await otherClient.disconnectOrders();
    assert.deepStrictEqual(otherClient.sockets.orders.readyState, CLOSED);
    await clientConnect;
    delete server.options.verifyClient;
  });

  test(".connect()", async () => {
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          assert.deepStrictEqual(url.search, "");
          assert.deepStrictEqual(url.hash, "");
          assert.deepStrictEqual(url.pathname, `/v2/marketdata`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      client.once("open", (market) => {
        try {
          assert.deepStrictEqual(market, "v2");
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await client.connect();
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
    await clientConnect;
    await serverConnect;
  });

  test(".connect() (when `readyState` is OPEN)", async () => {
    await client.connect();
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
    await client.connect();
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
  });

  test(".connect() (when `readyState` is CLOSED)", async () => {
    await client.connect();
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
    await client.disconnect();
    assert.deepStrictEqual(client.sockets.v2.readyState, CLOSED);
    await client.connect();
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
  });

  test(".connect() (when `readyState` is CLOSING)", async () => {
    await client.connect();
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
    const disconnect = client.disconnect();
    const error = new Error("Could not connect. State: 2");
    assert.deepStrictEqual(client.sockets.v2.readyState, CLOSING);
    await assert.rejects(client.connect(), error);
    await disconnect;
  });

  test(".connect() (when `readyState` is CONNECTING)", async () => {
    const connect = client.connect();
    const error = new Error("Could not connect. State: 0");
    assert.deepStrictEqual(client.sockets.v2.readyState, CONNECTING);
    await assert.rejects(client.connect(), error);
    await connect;
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
  });

  test(".disconnect()", async () => {
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          assert.deepStrictEqual(url.search, "");
          assert.deepStrictEqual(url.hash, "");
          assert.deepStrictEqual(url.pathname, `/v2/marketdata`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      client.once("open", (market) => {
        try {
          assert.deepStrictEqual(market, "v2");
          client.once("close", (_market) => {
            try {
              assert.deepStrictEqual(_market, "v2");
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    await client.connect();
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
    await client.disconnect();
    assert.deepStrictEqual(client.sockets.v2.readyState, CLOSED);
    await clientConnect;
    await serverConnect;
  });

  test(".disconnect() (when `socket` is not initialized)", async () => {
    assert.ok(typeof client.sockets.v2 === "undefined");
    await client.disconnect();
    assert.ok(typeof client.sockets.v2 === "undefined");
  });

  test(".disconnect() (when `readyState` is CLOSED)", async () => {
    await client.connect();
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
    await client.disconnect();
    assert.deepStrictEqual(client.sockets.v2.readyState, CLOSED);
    await client.disconnect();
    assert.deepStrictEqual(client.sockets.v2.readyState, CLOSED);
  });

  test(".disconnect() (when `readyState` is CLOSING)", async () => {
    await client.connect();
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
    const disconnect = client.disconnect();
    const error = new Error("Could not disconnect. State: 2");
    assert.deepStrictEqual(client.sockets.v2.readyState, CLOSING);
    await assert.rejects(client.disconnect(), error);
    await disconnect;
    assert.deepStrictEqual(client.sockets.v2.readyState, CLOSED);
  });

  test(".disconnect() (when `readyState` is CONNECTING)", async () => {
    const connect = client.connect();
    const error = new Error("Could not disconnect. State: 0");
    assert.deepStrictEqual(client.sockets.v2.readyState, CONNECTING);
    await assert.rejects(client.disconnect(), error);
    await connect;
    assert.deepStrictEqual(client.sockets.v2.readyState, OPEN);
  });

  test(".subscribe()", async () => {
    const subscriptions: Subscriptions = [
      { name: "l2", symbols: ["BTCUSD", "ETHUSD", "ETHBTC"] },
    ];
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (socket) => {
        socket.once("message", (data) => {
          try {
            const message = JSON.parse(data) as unknown;
            const type = "subscribe";
            assert.deepStrictEqual(message, { type, subscriptions });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    });

    await client.connect();
    await client.subscribe(subscriptions);
    await serverConnect;
  });

  test(".subscribe() (reject promise on errors)", async () => {
    const subscriptions: Subscriptions = [
      { name: "l2", symbols: ["BTCUSD", "ETHUSD", "ETHBTC"] },
    ];

    await client.connect();
    const disconnect = client.disconnect();
    const error = new Error("WebSocket is not open: readyState 2 (CLOSING)");
    await assert.rejects(client.subscribe(subscriptions), error);
    await disconnect;
  });

  test(".unsubscribe()", async () => {
    const subscriptions: Subscriptions = [
      { name: "l2", symbols: ["BTCUSD", "ETHUSD", "ETHBTC"] },
    ];
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (socket) => {
        socket.once("message", (data) => {
          try {
            const message = JSON.parse(data) as unknown;
            const type = "unsubscribe";
            assert.deepStrictEqual(message, { type, subscriptions });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    });

    await client.connect();
    await client.unsubscribe(subscriptions);
    await serverConnect;
  });

  test(".unsubscribe() (throws an error when ws in not initialized)", async () => {
    const subscriptions: Subscriptions = [
      { name: "l2", symbols: ["BTCUSD", "ETHUSD", "ETHBTC"] },
    ];
    const error = new Error("Websocket is not initialized");
    await assert.rejects(client.unsubscribe(subscriptions), error);
  });

  suite(".socket listeners", () => {
    suite(".onOpen()", () => {
      test("emits `open`", async () => {
        const clientConnect = new Promise<void>((resolve, reject) => {
          client.once("open", (market) => {
            try {
              assert.deepStrictEqual(market, "v2");
              client.once("open", (_market) => {
                try {
                  assert.deepStrictEqual(_market, "v2");
                  resolve();
                } catch (error) {
                  reject(error);
                }
              });
            } catch (error) {
              reject(error);
            }
          });
        });

        await client.connect();
        client.sockets.v2.emit("open");
        await clientConnect;
      });
    });

    suite(".onClose()", () => {
      test("emits `close`", async () => {
        const clientConnect = new Promise<void>((resolve, reject) => {
          client.once("close", (market) => {
            try {
              assert.deepStrictEqual(market, "v2");
              client.once("close", (_market) => {
                try {
                  assert.deepStrictEqual(_market, "v2");
                  resolve();
                } catch (error) {
                  reject(error);
                }
              });
            } catch (error) {
              reject(error);
            }
          });
        });

        await client.connect();
        await client.disconnect();
        client.sockets.v2.emit("close");
        await clientConnect;
      });
    });

    suite(".onError()", () => {
      test("emits `error`", async () => {
        const error = new Error("Something bad happened");
        const clientConnect = new Promise<void>((resolve, reject) => {
          client.once("error", (_error, market) => {
            try {
              assert.deepStrictEqual(market, "v2");
              assert.deepStrictEqual(_error, error);
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        });

        await client.connect();
        client.sockets.v2.emit("error", error);
        await clientConnect;
      });

      test("does not emit `error` with no argumets", async () => {
        const clientConnect = new Promise<void>((resolve, reject) => {
          client.once("error", reject);
          client.once("close", () => {
            resolve();
          });
        });

        await client.connect();
        client.sockets.v2.emit("error");
        await client.disconnect();
        await clientConnect;
      });
    });

    suite(".onMessage()", () => {
      test("emits `error` on bad JSON", async () => {
        const error = new SyntaxError(
          "Unexpected token N in JSON at position 0"
        );
        const clientConnect = new Promise<void>((resolve, reject) => {
          client.once("error", (_error, market) => {
            try {
              assert.deepStrictEqual(market, "v2");
              assert.deepStrictEqual(_error, error);
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        });

        await client.connect();
        client.sockets.v2.emit("message", "NotValidJSON");
        await clientConnect;
      });

      test("emits `message`", async () => {
        const message = {
          type: "candles_15m_updates",
          symbol: "BTCUSD",
          changes: [
            [1561054500000, 9350.18, 9358.35, 9350.18, 9355.51, 2.07],
            [1561053600000, 9357.33, 9357.33, 9350.18, 9350.18, 1.5900161],
          ],
        };
        const clientConnect = new Promise<void>((resolve, reject) => {
          client.once("message", (data, market) => {
            try {
              assert.deepStrictEqual(market, "v2");
              assert.deepStrictEqual(data, message);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        });

        await client.connect();
        client.sockets.v2.emit("message", JSON.stringify(message));
        await clientConnect;
      });
    });
  });
});
