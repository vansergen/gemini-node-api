# Gemini Node.js API [![CircleCI](https://circleci.com/gh/vansergen/gemini-node-api.svg?style=svg)](https://circleci.com/gh/vansergen/gemini-node-api) [![GitHub version](https://badge.fury.io/gh/vansergen%2Fgemini-node-api.svg)](https://github.com/vansergen/gemini-node-api/releases/latest) [![Known Vulnerabilities](https://snyk.io/test/github/vansergen/gemini-node-api/badge.svg)](https://snyk.io/test/github/vansergen/gemini-node-api) [![Coverage Status](https://coveralls.io/repos/github/vansergen/gemini-node-api/badge.svg?branch=master)](https://coveralls.io/github/vansergen/gemini-node-api?branch=master) [![languages](https://img.shields.io/github/languages/top/vansergen/gemini-node-api.svg)](https://github.com/vansergen/gemini-node-api) ![node](https://img.shields.io/node/v/gemini-node-api) [![npm downloads](https://img.shields.io/npm/dt/gemini-node-api.svg)](https://www.npmjs.com/package/gemini-node-api) [![license](https://img.shields.io/github/license/vansergen/gemini-node-api.svg)](https://github.com/vansergen/gemini-node-api/blob/master/LICENSE) [![Greenkeeper badge](https://badges.greenkeeper.io/vansergen/gemini-node-api.svg)](https://greenkeeper.io/)

Node.js library for [Gemini](https://docs.gemini.com/).

## Installation

```bash
npm install gemini-node-api
```

## Usage

### PublicClient

```typescript
import { PublicClient } from "gemini-node-api";
const client = new PublicClient();
```

- [`getSymbols`](https://docs.gemini.com/rest-api/#symbols)

```typescript
const symbols = await client.getSymbols();
```

- [`getTicker`](https://docs.gemini.com/rest-api/#ticker)

```typescript
const symbol = "zecltc";
const ticker = await client.getTicker({ symbol });
/**
 * for V2
 * @see https://docs.gemini.com/rest-api/#ticker-v2
 */
const v = "v2";
const tickerV2 = await client.getTicker({ symbol, v });
```

- [`getCandles`](https://docs.gemini.com/rest-api/#candles)

```typescript
const symbol = "zecltc";
const time_frame = "30m";
const candles = await client.getCandles({ symbol, time_frame });
```

- [`getOrderBook`](https://docs.gemini.com/rest-api/#current-order-book)

```typescript
const symbol = "zecltc";
const limit_bids = 25;
const limit_asks = 20;
const book = await client.getOrderBook({
  symbol,
  limit_bids,
  limit_asks
});
```

- [`getTradeHistory`](https://docs.gemini.com/rest-api/#trade-history)

```typescript
const symbol = "zecltc";
const timestamp = 1547146811;
const limit_trades = 100;
const include_breaks = true;
const trades = await client.getTradeHistory({
  symbol,
  timestamp,
  limit_trades,
  include_breaks
});
```

- [`getCurrentAuction`](https://docs.gemini.com/rest-api/#current-auction)

```typescript
const symbol = "zecltc";
const auction = await client.getCurrentAuction({ symbol });
```

- [`getAuctionHistory`](https://docs.gemini.com/rest-api/#auction-history)

```typescript
const symbol = "zecltc";
const timestamp = 1547146811;
const limit_auction_results = 100;
const include_indicative = true;
const history = await client.getAuctionHistory({
  symbol,
  timestamp,
  limit_auction_results,
  include_indicative
});
```

- [`getPriceFeed`](https://docs.gemini.com/rest-api/#price-feed)

```typescript
const priceFeed = await client.getPriceFeed();
```

### AuthenticatedClient

```typescript
import { AuthenticatedClient } from "gemini-node-api";
const key = "gemini-api-key";
const secret = "gemini-api-secret";
const client = new AuthenticatedClient({ key, secret });
```

- [`newOrder`](https://docs.gemini.com/rest-api/#new-order)

```typescript
const symbol = "zecltc";
const client_order_id = "d0c5340b-6d6c-49d9-b567-48c4bfca13d2";
const amount = 1;
const price = 0.9;
const side = "buy";
const options = ["maker-or-cancel"];
const order = await client.newOrder({
  symbol,
  client_order_id,
  amount,
  price,
  side,
  options
});
```

- [`buy`](https://docs.gemini.com/rest-api/#new-order)

```typescript
const symbol = "zecltc";
const amount = 1;
const price = 0.9;
const account = "primary";
const type = "exchange limit";
const order = await client.buy({ symbol, amount, price, account, type });
```

- [`sell`](https://docs.gemini.com/rest-api/#new-order)

```typescript
const symbol = "zecltc";
const amount = 0.99;
const price = 0.99;
const stop_price = 1;
const type = "exchange stop limit";
const order = await client.sell({ symbol, amount, price, stop_price, type });
```

- [`cancelOrder`](https://docs.gemini.com/rest-api/#cancel-order)

```typescript
const order_id = 106817811;
const account = "primary";
const order = await client.cancelOrder({ order_id, account });
```

- [`cancelSession`](https://docs.gemini.com/rest-api/#cancel-all-session-orders)

```typescript
const account = "primary";
const response = await client.cancelSession({ account });
```

- [`cancelAll`](https://docs.gemini.com/rest-api/#cancel-all-active-orders)

```typescript
const account = "primary";
const response = await client.cancelAll({ account });
```

- [`getOrderStatus`](https://docs.gemini.com/rest-api/#order-status)

```typescript
const order_id = 44375901;
const account = "primary";
const order = await client.getOrderStatus({ order_id, account });
```

- [`getActiveOrders`](https://docs.gemini.com/rest-api/#get-active-orders)

```typescript
const account = "primary";
const orders = await client.getActiveOrders({ account });
```

- [`getPastTrades`](https://docs.gemini.com/rest-api/#get-past-trades)

```typescript
const symbol = "bcheth";
const limit_trades = 10;
const timestamp = 1547232911;
const account = "primary";
const trades = await client.getPastTrades({
  symbol,
  limit_trades,
  timestamp,
  account
});
```

- [`getNotionalVolume`](https://docs.gemini.com/rest-api/#get-notional-volume)

```typescript
const account = "primary";
const volume = await client.getNotionalVolume({ account });
```

- [`getTradeVolume`](https://docs.gemini.com/rest-api/#get-trade-volume)

```typescript
const volume = await client.getTradeVolume();
```

- [`newClearingOrder`](https://docs.gemini.com/rest-api/#new-clearing-order)

```typescript
const counterparty_id = "OM9VNL1G";
const expires_in_hrs = 24;
const symbol = "btcusd";
const amount = 100;
const price = 9500;
const side = "buy";
const order = await client.newClearingOrder({
  counterparty_id,
  expires_in_hrs,
  symbol,
  amount,
  price,
  side
});
```

- [`newBrokerOrder`](https://docs.gemini.com/rest-api/#new-broker-order)

```typescript
const source_counterparty_id = "R485E04Q";
const target_counterparty_id = "Z4929ZDY";
const expires_in_hrs = 1;
const symbol = "ethusd";
const amount = 175;
const price = 200;
const side = "sell";
const order = await client.newBrokerOrder({
  source_counterparty_id,
  target_counterparty_id,
  expires_in_hrs,
  symbol,
  amount,
  price,
  side
});
```

- [`getClearingOrderStatus`](https://docs.gemini.com/rest-api/#clearing-order-status)

```typescript
const clearing_id = "OM9VNL1G";
const order = await client.getClearingOrderStatus({ clearing_id });
```

- [`cancelClearingOrder`](https://docs.gemini.com/rest-api/#cancel-clearing-order)

```typescript
const clearing_id = "OM9VNL1G";
const order = await client.cancelClearingOrder({ clearing_id });
```

- [`confirmClearingOrder`](https://docs.gemini.com/rest-api/#confirm-clearing-order)

```typescript
const clearing_id = "OM9VNL1G";
const symbol = "btcusd";
const amount = 100;
const price = 9500;
const side = "sell";
const order = await client.confirmClearingOrder({
  clearing_id,
  symbol,
  amount,
  price,
  side
});
```

- [`getAvailableBalances`](https://docs.gemini.com/rest-api/#get-available-balances)

```typescript
const account = "primary";
const balances = await client.getAvailableBalances({ account });
```

- [`getTransfers`](https://docs.gemini.com/rest-api/#transfers)

```typescript
const timestamp = 1495127793;
const limit_transfers = 12;
const account = "primary";
const transfers = await client.getTransfers({
  timestamp,
  limit_transfers,
  account
});
```

- [`getNewAddress`](https://docs.gemini.com/rest-api/#new-deposit-address)

```typescript
const currency = "ltc";
const label = "New LTC deposit address";
const legacy = true;
const account = "primary";
const address = await client.getNewAddress({
  currency,
  label,
  legacy,
  account
});
```

- [`withdrawCrypto`](https://docs.gemini.com/rest-api/#withdraw-crypto-funds-to-whitelisted-address)

```typescript
const currency = "btc";
const address = "mi98Z9brJ3TgaKsmvXatuRahbFRUFKRUdR";
const amount = 10;
const account = "primary";
const withdrawal = await client.withdrawCrypto({
  currency,
  address,
  account,
  amount
});
```

- [`internalTransfer`](https://docs.gemini.com/rest-api/#internal-transfers)

```typescript
const currency = "btc";
const sourceAccount = "primary";
const targetAccount = "secondary";
const amount = "100";
const transfer = await client.internalTransfer({
  currency,
  sourceAccount,
  targetAccount,
  amount
});
```

- [`createAccount`](https://docs.gemini.com/rest-api/#create-account)

```typescript
const name = "My Secondary Account";
const type = "custody";
const result = await client.createAccount({ name, type });
```

- [`getAccounts`](https://docs.gemini.com/rest-api/#get-accounts-in-master-group)

```typescript
const accounts = await client.getAccounts();
```

- [`withdrawGUSD`](https://docs.gemini.com/rest-api/#withdraw-usd-as-gusd)

```typescript
const address = "0x0F2B20Acb2fD7EEbC0ABc3AEe0b00d57533b6bD1";
const amount = "500";
const account = "primary";
const withdrawal = await client.withdrawGUSD({ address, amount, account });
```

- [`heartbeat`](https://docs.gemini.com/rest-api/#heartbeat)

```typescript
const heartbeat = await client.heartbeat();
```

### [WebsocketClient](https://docs.gemini.com/websocket-api/)

```typescript
import { WebsocketClient } from "gemini-node-api";
const key = "gemini-api-key";
const secret = "gemini-api-secret";
const websocket = new WebsocketClient({ key, secret });
websocket.on("error", (error, market) => {
  console.error(error);
});
websocket.on("open", market => {
  console.log("The connection is open", market);
});
websocket.on("close", market => {
  console.log("The connection is closed", market);
});
websocket.on("message", (message, market) => {
  console.info("New message from", market);
  console.info(message);
});
```

- [`connectMarket`](https://docs.gemini.com/websocket-api/#market-data)

```typescript
const heartbeat = true;
const top_of_book = false;
const bids = true;
const offers = true;
const trades = true;
const auctions = false;
const symbol = "zecltc";
websocket.on("open", market => console.log("Open:", market));
websocket.connectMarket({
  symbol,
  heartbeat,
  top_of_book,
  bids,
  offers,
  trades,
  auctions
});
websocket.connectMarket({ symbol: "btcusd" });
```

- [`disconnectMarket`](https://docs.gemini.com/websocket-api/#market-data)

```typescript
const symbol = "zecltc";
websocket.once("close", market => console.log("Closed:", market));
websocket.disconnectMarket({ symbol });
```

- [`connect`](https://docs.gemini.com/websocket-api/#market-data-version-2)

```typescript
websocket.on("open", market => console.log("Open:", market));
websocket.connect();
```

- [`disconnect`](https://docs.gemini.com/websocket-api/#market-data-version-2)

```typescript
websocket.once("close", market => console.log("Closed:", market));
websocket.disconnect();
```

- [`subscribe`](https://docs.gemini.com/websocket-api/#level-2-data)

```typescript
const subscriptions = [
  { name: "l2", symbols: ["BTCUSD", "ETHUSD"] },
  { name: "candles_1m", symbols: ["BTCUSD"] }
];
websocket.on("open", market => {
  if (market === "v2") {
    websocket.subscribe(subscriptions);
  }
});
```

- [`unsubscribe`](https://docs.gemini.com/websocket-api/#unsubscribe)

```typescript
const subscriptions = [{ name: "l2", symbols: ["BTCUSD", "ETHUSD"] }];
websocket.unsubscribe(subscriptions);
```

- [`connectOrders`](https://docs.gemini.com/websocket-api/#order-events)

```typescript
const symbolFilter = "zecltc";
const apiSessionFilter = "UI";
const eventTypeFilter = ["accepted", "rejected"];
const account = "primary";
websocket.on("message", (message, market) => {
  if (market === "orders") {
    console.log("New message:", message);
  }
});
websocket.connectOrders({
  account,
  symbolFilter,
  apiSessionFilter,
  eventTypeFilter
});
```

- [`disconnectOrders`](https://docs.gemini.com/websocket-api/#order-events)

```typescript
websocket.once("close", market => {
  if (market === "orders") {
    console.log("Closed");
  }
});
websocket.disconnectOrders();
```

### Test

```bash
npm test
```
