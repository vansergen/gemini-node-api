# Gemini Node.js API [![CircleCI](https://circleci.com/gh/vansergen/gemini-node-api.svg?style=svg)](https://circleci.com/gh/vansergen/gemini-node-api)

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
