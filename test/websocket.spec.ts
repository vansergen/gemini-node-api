import { deepStrictEqual, ok, rejects } from "assert";
import { stringify } from "node:querystring";
import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import {
  WebsocketClient,
  WsUri,
  SandboxWsUri,
  DefaultSymbol,
  Subscriptions,
  AuthHeaders,
  SignRequest,
  WSSignerOptions,
} from "../index.js";

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
  let server: WebSocketServer;

  setup(async () => {
    await new Promise<void>((resolve) => {
      server = new WebSocketServer({ port }, resolve);
    });
    client = new WebsocketClient({ wsUri });
  });

  teardown(async () => {
    server.clients?.forEach((c) => c.close());
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

    deepStrictEqual(otherClient.wsUri, WsUri);
    deepStrictEqual(otherClient.symbol, DefaultSymbol);
  });

  test("constructor (with sandbox flag)", () => {
    const otherClient = new WebsocketClient({ sandbox: true, key, symbol });

    deepStrictEqual(otherClient.wsUri, SandboxWsUri);
    deepStrictEqual(otherClient.symbol, symbol);
  });

  test("constructor (with `wsUri`)", () => {
    const otherClient = new WebsocketClient({ key, secret, wsUri });

    deepStrictEqual(otherClient.wsUri, wsUri);
    deepStrictEqual(otherClient.symbol, DefaultSymbol);
  });

  test(".connectMarket()", async () => {
    const queryParams = { heartbeat: true, bids: true };
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          deepStrictEqual(url.search, `?${stringify(queryParams)}`);
          deepStrictEqual(url.hash, "");
          deepStrictEqual(url.pathname, `/v1/marketdata/${symbol}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      client.once("open", (market) => {
        try {
          deepStrictEqual(market, symbol);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await client.connectMarket({ symbol, ...queryParams });
    deepStrictEqual(client.sockets[symbol].readyState, WebSocket.OPEN);
    await clientConnect;
    await serverConnect;
  });

  test(".connectMarket() (with no `symbol`)", async () => {
    const otherClient = new WebsocketClient({ wsUri, symbol });
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          deepStrictEqual(url.search, "");
          deepStrictEqual(url.hash, "");
          deepStrictEqual(url.pathname, `/v1/marketdata/${symbol}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      otherClient.once("open", (market) => {
        try {
          deepStrictEqual(market, symbol);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await otherClient.connectMarket();
    deepStrictEqual(otherClient.sockets[symbol].readyState, WebSocket.OPEN);
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
          deepStrictEqual(url.search, "");
          deepStrictEqual(url.hash, "");
          deepStrictEqual(url.pathname, `/v1/marketdata/${_symbol}`);
          server.once("connection", (__socket, _req) => {
            try {
              const newUrl = new URL(_req.url ?? "", wsUri);
              deepStrictEqual(newUrl.search, `?${stringify({ heartbeat })}`);
              deepStrictEqual(newUrl.hash, "");
              deepStrictEqual(newUrl.pathname, `/v1/marketdata/${symbol}`);
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
          deepStrictEqual(market, _symbol);
          otherClient.once("open", (otherMarket) => {
            try {
              deepStrictEqual(otherMarket, symbol);
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
    deepStrictEqual(otherClient.sockets[_symbol].readyState, WebSocket.OPEN);
    await otherClient.connectMarket({ heartbeat });
    deepStrictEqual(otherClient.sockets[symbol].readyState, WebSocket.OPEN);
    await clientConnect;
    await serverConnect;
  });

  test(".disconnectMarket()", async () => {
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          deepStrictEqual(url.search, "");
          deepStrictEqual(url.hash, "");
          deepStrictEqual(url.pathname, `/v1/marketdata/${symbol}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      client.once("open", (market) => {
        try {
          deepStrictEqual(market, symbol);
          client.once("close", (otherMarket) => {
            try {
              deepStrictEqual(otherMarket, symbol);
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
          deepStrictEqual(url.search, "");
          deepStrictEqual(url.hash, "");
          deepStrictEqual(url.pathname, `/v1/marketdata/${symbol}`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      otherClient.once("open", (market) => {
        try {
          deepStrictEqual(market, symbol);
          otherClient.once("close", (otherMarket) => {
            try {
              deepStrictEqual(otherMarket, symbol);
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
    deepStrictEqual(otherClient.sockets[symbol].readyState, WebSocket.OPEN);
    await otherClient.disconnectMarket();
    deepStrictEqual(otherClient.sockets[symbol].readyState, WebSocket.CLOSED);
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
          deepStrictEqual(url.search, "");
          deepStrictEqual(url.hash, "");
          deepStrictEqual(url.pathname, request);
          const verify = VerifySignature(req, key, secret);
          ok(verify);
          const { "X-GEMINI-PAYLOAD": payload } = verify;
          const parsedPayload = JSON.parse(
            Buffer.from(payload, "base64").toString("utf8")
          ) as WSSignerOptions;
          deepStrictEqual(parsedPayload, { request, nonce });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      otherClient.once("open", (market) => {
        try {
          deepStrictEqual(market, "orders");
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await otherClient.connectOrders();
    deepStrictEqual(otherClient.sockets.orders.readyState, WebSocket.OPEN);
    await clientConnect;
    await serverConnect;
    delete server.options.verifyClient;
  });

  test(".connectOrders() (with no api key)", async () => {
    const otherClient = new WebsocketClient({ wsUri, secret });
    const error = new Error("`connectOrders` requires both `key` and `secret`");
    await rejects(otherClient.connectOrders(), error);
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
          deepStrictEqual(url.search, `?${stringify(qs)}`);
          deepStrictEqual(url.hash, "");
          deepStrictEqual(url.pathname, request);
          const verify = VerifySignature(req, key, secret);
          ok(verify);
          const { "X-GEMINI-PAYLOAD": payload } = verify;
          const parsedPayload = JSON.parse(
            Buffer.from(payload, "base64").toString("utf8")
          ) as WSSignerOptions;
          deepStrictEqual(parsedPayload, { request, nonce, account });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      otherClient.once("open", (market) => {
        try {
          deepStrictEqual(market, "orders");
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await otherClient.connectOrders({ account, ...qs });
    deepStrictEqual(otherClient.sockets.orders.readyState, WebSocket.OPEN);
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
          deepStrictEqual(market, "orders");
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await otherClient.connectOrders();
    deepStrictEqual(otherClient.sockets.orders.readyState, WebSocket.OPEN);
    await otherClient.disconnectOrders();
    deepStrictEqual(otherClient.sockets.orders.readyState, WebSocket.CLOSED);
    await clientConnect;
    delete server.options.verifyClient;
  });

  test(".connect()", async () => {
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          deepStrictEqual(url.search, "");
          deepStrictEqual(url.hash, "");
          deepStrictEqual(url.pathname, `/v2/marketdata`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      client.once("open", (market) => {
        try {
          deepStrictEqual(market, "v2");
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await client.connect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
    await clientConnect;
    await serverConnect;
  });

  test(".connect() (when `readyState` is OPEN)", async () => {
    await client.connect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
    await client.connect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
  });

  test(".connect() (when `readyState` is CLOSED)", async () => {
    await client.connect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
    await client.disconnect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.CLOSED);
    await client.connect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
  });

  test(".connect() (when `readyState` is CLOSING)", async () => {
    await client.connect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
    const disconnect = client.disconnect();
    const error = new Error("Could not connect. State: 2");
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.CLOSING);
    await rejects(client.connect(), error);
    await disconnect;
  });

  test(".connect() (when `readyState` is CONNECTING)", async () => {
    const connect = client.connect();
    const error = new Error("Could not connect. State: 0");
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.CONNECTING);
    await rejects(client.connect(), error);
    await connect;
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
  });

  test(".disconnect()", async () => {
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (_socket, req) => {
        try {
          const url = new URL(req.url ?? "", wsUri);
          deepStrictEqual(url.search, "");
          deepStrictEqual(url.hash, "");
          deepStrictEqual(url.pathname, `/v2/marketdata`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    const clientConnect = new Promise<void>((resolve, reject) => {
      client.once("open", (market) => {
        try {
          deepStrictEqual(market, "v2");
          client.once("close", (_market) => {
            try {
              deepStrictEqual(_market, "v2");
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
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
    await client.disconnect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.CLOSED);
    await clientConnect;
    await serverConnect;
  });

  test(".disconnect() (when `socket` is not initialized)", async () => {
    ok(typeof client.sockets.v2 === "undefined");
    await client.disconnect();
    ok(typeof client.sockets.v2 === "undefined");
  });

  test(".disconnect() (when `readyState` is CLOSED)", async () => {
    await client.connect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
    await client.disconnect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.CLOSED);
    await client.disconnect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.CLOSED);
  });

  test(".disconnect() (when `readyState` is CLOSING)", async () => {
    await client.connect();
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
    const disconnect = client.disconnect();
    const error = new Error("Could not disconnect. State: 2");
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.CLOSING);
    await rejects(client.disconnect(), error);
    await disconnect;
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.CLOSED);
  });

  test(".disconnect() (when `readyState` is CONNECTING)", async () => {
    const connect = client.connect();
    const error = new Error("Could not disconnect. State: 0");
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.CONNECTING);
    await rejects(client.disconnect(), error);
    await connect;
    deepStrictEqual(client.sockets.v2.readyState, WebSocket.OPEN);
  });

  test(".subscribe()", async () => {
    const subscriptions: Subscriptions = [
      { name: "l2", symbols: ["BTCUSD", "ETHUSD", "ETHBTC"] },
    ];
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (socket) => {
        socket.once("message", (data: string) => {
          try {
            const message = JSON.parse(data) as unknown;
            const type = "subscribe";
            deepStrictEqual(message, { type, subscriptions });
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
    await rejects(client.subscribe(subscriptions), error);
    await disconnect;
  });

  test(".unsubscribe()", async () => {
    const subscriptions: Subscriptions = [
      { name: "l2", symbols: ["BTCUSD", "ETHUSD", "ETHBTC"] },
    ];
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (socket) => {
        socket.once("message", (data: string) => {
          try {
            const message = JSON.parse(data) as unknown;
            const type = "unsubscribe";
            deepStrictEqual(message, { type, subscriptions });
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
    await rejects(client.unsubscribe(subscriptions), error);
  });

  suite("socket events", () => {
    suite("open", () => {
      test("emits `open`", async () => {
        const clientConnect = new Promise<void>((resolve, reject) => {
          client.once("open", (market) => {
            try {
              deepStrictEqual(market, "v2");
              client.once("open", (_market) => {
                try {
                  deepStrictEqual(_market, "v2");
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

    suite("close", () => {
      test("emits `close`", async () => {
        const clientConnect = new Promise<void>((resolve, reject) => {
          client.once("close", (market) => {
            try {
              deepStrictEqual(market, "v2");
              client.once("close", (_market) => {
                try {
                  deepStrictEqual(_market, "v2");
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

    suite("error", () => {
      test("emits `error`", async () => {
        const error = new Error("Something bad happened");
        const clientConnect = new Promise<void>((resolve, reject) => {
          client.once("error", (_error, market) => {
            try {
              deepStrictEqual(market, "v2");
              deepStrictEqual(_error, error);
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

    suite("message", () => {
      test("emits `error` on bad JSON", async () => {
        const error = new SyntaxError(
          "Unexpected token N in JSON at position 0"
        );
        const clientConnect = new Promise<void>((resolve, reject) => {
          client.once("error", (_error, market) => {
            try {
              deepStrictEqual(market, "v2");
              deepStrictEqual(_error, error);
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
              deepStrictEqual(market, "v2");
              deepStrictEqual(data, message);
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
