# Gemini Node.js API [![CircleCI](https://circleci.com/gh/vansergen/gemini-node-api.svg?style=svg)](https://circleci.com/gh/vansergen/gemini-node-api) [![GitHub version](https://badge.fury.io/gh/vansergen%2Fgemini-node-api.svg)](https://github.com/vansergen/gemini-node-api/releases/latest) [![npm version](https://badge.fury.io/js/gemini-node-api.svg)](https://www.npmjs.com/package/gemini-node-api/v/latest) [![languages](https://img.shields.io/github/languages/top/vansergen/gemini-node-api.svg)](https://github.com/vansergen/gemini-node-api) [![dependency status](https://img.shields.io/librariesio/github/vansergen/gemini-node-api.svg)](https://github.com/vansergen/gemini-node-api) [![repo size](https://img.shields.io/github/repo-size/vansergen/gemini-node-api.svg)](https://github.com/vansergen/gemini-node-api) [![npm downloads](https://img.shields.io/npm/dt/gemini-node-api.svg)](https://www.npmjs.com/package/gemini-node-api) [![license](https://img.shields.io/github/license/vansergen/gemini-node-api.svg)](https://github.com/vansergen/gemini-node-api/blob/master/LICENSE)

Node.js library for [Gemini](https://docs.gemini.com/).

## Installation

```bash
npm install gemini-node-api
```

## Usage

### PublicClient

```javascript
const { PublicClient } = require('gemini-node-api');
const publicClient = new PublicClient();
```

- [`getSymbols`](https://docs.gemini.com/rest-api/#symbols)

```javascript
const symbols = await publicClient.getSymbols();
```

- [`getTicker`](https://docs.gemini.com/rest-api/#ticker)

```javascript
const symbol = 'zecltc';
const ticker = await publicClient.getTicker({ symbol });
```

- [`getOrderBook`](https://docs.gemini.com/rest-api/#current-order-book)

```javascript
const symbol = 'zecltc';
const limit_bids = 25;
const limit_asks = 20;
const book = await publicClient.getOrderBook({
  symbol,
  limit_bids,
  limit_asks,
});
```

- [`getTradeHistory`](https://docs.gemini.com/rest-api/#trade-history)

```javascript
const symbol = 'zecltc';
const since = 1547146811;
const limit_trades = 100;
const include_breaks = true;
const trades = await publicClient.getTradeHistory({
  symbol,
  since,
  limit_trades,
  include_breaks,
});
```

- [`getCurrentAuction`](https://docs.gemini.com/rest-api/#current-auction)

```javascript
const symbol = 'zecltc';
const auction = await publicClient.getCurrentAuction({ symbol });
```

- [`getAuctionHistory`](https://docs.gemini.com/rest-api/#auction-history)

```javascript
const symbol = 'zecltc';
const since = 1547146811;
const limit_auction_results = 100;
const include_indicative = true;
const history = await publicClient.getAuctionHistory({
  symbol,
  since,
  limit_auction_results,
  include_indicative,
});
```

- `get`

```javascript
publicClient
  .get({ uri: 'v1/auction/zecbtc' })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });
```

- `request`

```javascript
const method = 'GET';
const uri = 'v1/pubticker/zecbtc';
publicClient
  .request({ method, uri })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });
```

- `cb`

```javascript
const _method = 'getTicker';
const symbol = 'bchusd';
const callback = (error, data) => {
  if (error) {
    console.error(error);
  } else {
    console.info(data);
  }
};
publicClient.cb({ _method, symbol }, callback);
```

### AuthenticatedClient

```javascript
const { AuthenticatedClient } = require('gemini-node-api');
const key = 'gemini-api-key';
const secret = 'gemini-api-secret';
const authClient = new AuthenticatedClient({ key, secret });
```

- [`newOrder`](https://docs.gemini.com/rest-api/#new-order)

```javascript
const order = await authClient.newOrder({
  symbol: 'zecltc',
  client_order_id: 'd0c5340b-6d6c-49d9-b567-48c4bfca13d2',
  amount: 1,
  price: 0.9,
  side: 'buy',
  moc: true, // maker-or-cancel
  ioc: false, // immediate-or-cancel
  fok: false, // fill-or-kill
  ao: false, // auction-only
  ioi: false, // indication-of-interest
});
```

- [`buy`](https://docs.gemini.com/rest-api/#new-order)

```javascript
const symbol = 'zecltc';
const amount = 1;
const price = 0.9;
const order = await authClient.buy({ symbol, amount, price });
```

- [`sell`](https://docs.gemini.com/rest-api/#new-order)

```javascript
const symbol = 'zecltc';
const amount = 0.99;
const price = 0.99;
const order = await authClient.sell({ symbol, amount, price });
```

- [`cancelOrder`](https://docs.gemini.com/rest-api/#cancel-order)

```javascript
const order_id = 106817811;
const order = await authClient.cancelOrder({ order_id });
```

- [`cancelSession`](https://docs.gemini.com/rest-api/#cancel-all-session-orders)

```javascript
const response = await authClient.cancelSession();
```

- [`cancelAll`](https://docs.gemini.com/rest-api/#cancel-all-active-orders)

```javascript
const response = await authClient.cancelAll();
```

- [`getOrderStatus`](https://docs.gemini.com/rest-api/#order-status)

```javascript
const order_id = 44375901;
const order = await authClient.getOrderStatus({ order_id });
```

- [`getActiveOrders`](https://docs.gemini.com/rest-api/#get-active-orders)

```javascript
const orders = await authClient.getActiveOrders();
```

- [`getPastTrades`](https://docs.gemini.com/rest-api/#get-past-trades)

```javascript
const symbol = 'bcheth';
const limit_trades = 10;
const timestamp = 1547232911;
const trades = await authClient.getPastTrades({
  symbol,
  limit_trades,
  timestamp,
});
```

- [`getNotionalVolume`](https://docs.gemini.com/rest-api/#get-notional-volume)

```javascript
const volume = await authClient.getNotionalVolume();
```

- [`getTradeVolume`](https://docs.gemini.com/rest-api/#get-trade-volume)

```javascript
const volume = await authClient.getTradeVolume();
```

- [`getAvailableBalances`](https://docs.gemini.com/rest-api/#get-available-balances)

```javascript
const balances = await authClient.getAvailableBalances();
```

- [`getTransfers`](https://docs.gemini.com/rest-api/#transfers)

```javascript
const timestamp = 1495127793;
const limit_transfers = 12;
const transfers = await authClient.getTransfers({ timestamp, limit_transfers });
```

- [`getNewAddress`](https://docs.gemini.com/rest-api/#new-deposit-address)

```javascript
const currency = 'ltc';
const label = 'New LTC deposit address';
const legacy = true;
const address = await authClient.getNewAddress({ currency, label, legacy });
```

- [`withdrawCrypto`](https://docs.gemini.com/rest-api/#withdraw-crypto-funds-to-whitelisted-address)

```javascript
const currency = 'btc';
const address = 'mi98Z9brJ3TgaKsmvXatuRahbFRUFKRUdR';
const amount = 10;
const withdrawal = await authClient.withdrawCrypto({
  currency,
  address,
  amount,
});
```

- [`withdrawGUSD`](https://docs.gemini.com/rest-api/#withdraw-usd-as-gusd)

```javascript
const address = '0x0F2B20Acb2fD7EEbC0ABc3AEe0b00d57533b6bD1';
const amount = 500;
const withdrawal = await authClient.withdrawGUSD({ address, amount });
```

- [`heartbeat`](https://docs.gemini.com/rest-api/#heartbeat)

```javascript
const heartbeat = await authClient.heartbeat();
```

- `post`

```javascript
const volume = await authClient.post({ request: '/v1/tradevolume' });
```

- `cb`

```javascript
const _method = 'getNotionalVolume';
const callback = (error, data) => {
  if (error) {
    console.error(error);
  } else {
    console.info(data);
  }
};
authClient.cb({ _method }, callback);
```

### WebsocketClient

```javascript
const { WebsocketClient } = require('gemini-node-api');
const key = 'gemini-api-key';
const secret = 'gemini-api-secret';
const websocket = new WebsocketClient({ key, secret });
websocket.on('error', (error, market) => {
  console.error(error);
});
websocket.on('open', market => {
  console.log('Open connection: ', market);
});
websocket.on('close', market => {
  console.log('Closed connection: ', market);
});
websocket.on('message', (message, market) => {
  console.info(message);
});
```

- [`connectMarket`](https://docs.gemini.com/websocket-api/#market-data)

```javascript
const heartbeat = true;
const top_of_book = false;
const bids = true;
const offers = true;
const trades = true;
const auctions = false;
const symbol = 'zecltc';
websocket.on('open', market => console.log('Open:', market));
websocket.connectMarket({
  symbol,
  heartbeat,
  top_of_book,
  bids,
  offers,
  trades,
  auctions,
});
websocket.connectMarket({ symbol: 'btcusd' });
```

- [`disconnectMarket`](https://docs.gemini.com/websocket-api/#market-data)

```javascript
const symbol = 'zecltc';
websocket.once('close', market => console.log('Closed:', market));
websocket.disconnectMarket({ symbol });
```

- [`connectOrders`](https://docs.gemini.com/websocket-api/#order-events)

```javascript
const symbolFilter = 'zecltc';
const apiSessionFilter = 'UI';
const eventTypeFilter = ['accepted', 'rejected'];
websocket.on('message', (message, market) => {
  if (market === 'orders') {
    console.log('New message:', message);
  }
});
websocket.connectOrders({ symbolFilter, apiSessionFilter, eventTypeFilter });
```

### SignRequest

```javascript
const { SignRequest } = require('gemini-node-api');

const key = 'Gemini-API-KEY';
const secret = 'Gemini-API-SECRET';

const request = '/v1/deposit/btc/newAddress';
const nonce = 1;
const label = 'My first Gemini deposit address';

const headers = SignRequest({ key, secret }, { request, nonce, label });
// headers
{
  'X-GEMINI-PAYLOAD': 'eyJyZXF1ZXN0IjoiL3YxL2RlcG9zaXQvYnRjL25ld0FkZHJlc3MiLCJub25jZSI6MSwibGFiZWwiOiJNeSBmaXJzdCBHZW1pbmkgZGVwb3NpdCBhZGRyZXNzIn0=',
  'X-GEMINI-SIGNATURE': '1bf000f1de4eb00384e5b9e84f8128cdff86b392c202bc5366cd7df408d592a649999fd22a7d9f7e445cf30e6cbcfbb0',
  'X-GEMINI-APIKEY': 'Gemini-API-KEY'
}
```

### Test

```bash
npm test
```
