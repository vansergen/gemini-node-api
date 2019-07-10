const assert = require('assert');
const wss = require('./lib/wss.js');

const { WebsocketClient } = require('../index.js');

const {
  EXCHANGE_WS_URL,
  DEFAULT_SYMBOL,
  SANDBOX_WS_URL,
} = require('../lib/utilities.js');

const port = 56255;
const api_uri = 'ws://localhost:' + port;

const key = 'Gemini-API-key';
const secret = 'Gemini-API-secret';
const symbol = 'zecbtc';

suite('WebsocketClient', () => {
  test('.constructor()', () => {
    const client = new WebsocketClient();
    assert.deepStrictEqual(client.api_uri, EXCHANGE_WS_URL);
    assert.deepStrictEqual(client.symbol, DEFAULT_SYMBOL);
    assert.deepStrictEqual(client.key, undefined);
    assert.deepStrictEqual(client.secret, undefined);
  });

  test('.constructor() (with sandbox flag)', () => {
    const sandbox = true;
    const client = new WebsocketClient({ sandbox, symbol, key, secret });
    assert.deepStrictEqual(client.api_uri, SANDBOX_WS_URL);
    assert.deepStrictEqual(client.symbol, symbol);
    assert.deepStrictEqual(client.key, key);
    assert.deepStrictEqual(client.secret, secret);
  });

  test('connectMarket()', done => {
    const server = wss({ port });
    const client = new WebsocketClient({ api_uri });
    client.once('message', (message, _symbol) => {
      assert.deepStrictEqual(message.socket_sequence, 0);
      assert.deepStrictEqual(_symbol, symbol);
      server.close();
      done();
    });
    client.connectMarket({ symbol });
  });

  test('connectMarket() (with default symbol)', done => {
    const server = wss({ port });
    const client = new WebsocketClient({ api_uri, symbol });
    client.once('message', (message, _symbol) => {
      assert.deepStrictEqual(message.socket_sequence, 0);
      assert.deepStrictEqual(_symbol, symbol);
      server.close();
      done();
    });
    client.connectMarket();
  });

  test('connectMarket() (with extra parameters)', done => {
    const heartbeat = true;
    const top_of_book = true;
    const bids = true;
    const offers = true;
    const trades = false;
    const auctions = false;
    const server = wss({ port });
    const client = new WebsocketClient({ api_uri });
    client.once('message', (message, _symbol) => {
      assert.deepStrictEqual(message.socket_sequence, 0);
      assert.deepStrictEqual(_symbol, DEFAULT_SYMBOL);
      assert.deepStrictEqual(message.heartbeat, heartbeat);
      assert.deepStrictEqual(message.top_of_book, top_of_book);
      assert.deepStrictEqual(message.bids, bids);
      assert.deepStrictEqual(message.offers, offers);
      assert.deepStrictEqual(message.trades, trades);
      assert.deepStrictEqual(message.auctions, auctions);
      server.close();
      done();
    });
    client.connectMarket({
      heartbeat,
      top_of_book,
      bids,
      offers,
      trades,
      auctions,
    });
  });

  test('connectMarket() (connects to different markets)', done => {
    const server = wss({ port });
    const client = new WebsocketClient({ api_uri });
    const last = { [DEFAULT_SYMBOL]: false, [symbol]: false };
    const seq = { [DEFAULT_SYMBOL]: 0, [symbol]: 0 };
    client.on('message', (message, _symbol) => {
      if (_symbol === DEFAULT_SYMBOL) {
        assert.deepStrictEqual(message.socket_sequence, seq[DEFAULT_SYMBOL]++);
      } else if (_symbol === symbol) {
        assert.deepStrictEqual(message.socket_sequence, seq[symbol]++);
      } else {
        assert.fail('Unrecognized symbol');
      }
      if (message.last) {
        last[_symbol] = true;
        if (last[symbol] && last[DEFAULT_SYMBOL]) {
          server.close();
          done();
        }
      }
    });
    client.connectMarket({ symbol });
    client.connectMarket();
  });
});
