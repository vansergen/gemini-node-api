# Gemini Node.js API [![CircleCI](https://circleci.com/gh/vansergen/gemini-node-api.svg?style=svg)](https://circleci.com/gh/vansergen/gemini-node-api) [![GitHub version](https://badge.fury.io/gh/vansergen%2Fgemini-node-api.svg)](https://badge.fury.io/gh/vansergen%2Fgemini-node-api) [![npm version](https://badge.fury.io/js/gemini-node-api.svg)](https://badge.fury.io/js/gemini-node-api) [![languages](https://img.shields.io/github/languages/top/vansergen/gemini-node-api.svg)](https://github.com/vansergen/gemini-node-api) [![dependency status](https://img.shields.io/librariesio/github/vansergen/gemini-node-api.svg)](https://github.com/vansergen/gemini-node-api) [![repo size](https://img.shields.io/github/repo-size/vansergen/gemini-node-api.svg)](https://github.com/vansergen/gemini-node-api) [![npm downloads](https://img.shields.io/npm/dt/gemini-node-api.svg)](https://www.npmjs.com/package/gemini-node-api) [![license](https://img.shields.io/github/license/vansergen/gemini-node-api.svg)](https://github.com/vansergen/gemini-node-api/blob/master/LICENSE)

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
