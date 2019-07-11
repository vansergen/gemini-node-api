const SignRequest = require('./signer.js');
const Websocket = require('ws');
const EventEmitter = require('events');
const querystring = require('querystring');

const {
  EXCHANGE_WS_URL,
  SANDBOX_WS_URL,
  DEFAULT_SYMBOL,
  _checkUndefined,
} = require('./utilities');

class WebsocketClient extends EventEmitter {
  /**
   * @extends EventEmitter
   * @param {Object} [options]
   * @param {string} [options.key] - Gemini API key.
   * @param {string} [options.secret] - Gemini API secret.
   * @param {string} [options.symbol] - Optional symbol.
   * @param {boolean} [options.sandbox] - If set to `true`, WebsocketClient will use the sandbox endpoints.
   * @param {string} [options.api_uri] - Overrides the default apiuri if provided.
   * @example
   * const { WebsocketClient } = require('gemini-node-api');
   * const key = 'Gemini-api-key';
   * const secret = 'Gemini-api-secret';
   * const websocket = new WebsocketClient({ key, secret });
   * @description Create WebsocketClient.
   */
  constructor({ symbol, api_uri, sandbox, key, secret } = {}) {
    super();
    this.api_uri = sandbox ? SANDBOX_WS_URL : EXCHANGE_WS_URL;
    this.api_uri = api_uri ? api_uri : this.api_uri;
    this.symbol = symbol ? symbol : DEFAULT_SYMBOL;
    this.sockets = {};
    this.key = key;
    this.secret = secret;
  }

  /**
   * @param {Object} [options]
   * @param {string} [options.symbol] - Trading symbol.
   * @param {boolean} [options.heartbeat] - Optionally add this parameter and set to `true` to receive a heartbeat every 5 seconds.
   * @param {boolean} [options.top_of_book] - If absent or `false`, receive full order book depth; if present and `true`, receive top of book only. Only applies to bids and offers.
   * @param {boolean} [options.bids] - Include bids in `change` events.
   * @param {boolean} [options.offers] - Include asks in `change` events.
   * @param {boolean} [options.trades] - Include `trade` events.
   * @param {boolean} [options.auctions] - Include `auction` events.
   * @example
   * websocket.connectMarket({ symbol: 'btcusd' });
   * @description Connect to the public API that streams all the market data on a given symbol.
   * @see {@link https://docs.gemini.com/websocket-api/#market-data|market-data}
   */
  connectMarket({
    symbol = this.symbol,
    heartbeat,
    top_of_book,
    bids,
    offers,
    trades,
    auctions,
  } = {}) {
    this._checkSocketConnect(this.sockets[symbol]);

    const options = { heartbeat, top_of_book, bids, offers, trades, auctions };
    _checkUndefined(options, true);
    let qs = querystring.stringify(options);
    if (qs) {
      qs = '?' + qs;
    }

    const uri = this.api_uri + '/v1/marketdata/' + symbol + qs;
    this.sockets[symbol] = new Websocket(uri);
    this._addListeners(this.sockets[symbol], symbol);
  }

  /**
   * @param {Object} [options]
   * @param {string|string[]} [options.symbolFilter] - Optional symbol filter for order event subscription.
   * @param {string|string[]} [options.apiSessionFilter] - Optional API session key filter for order event subscription.
   * @param {string|string[]} [options.eventTypeFilter] - Optional order event type filter for order event subscription.
   * @example
   * websocket.connectOrders();
   * @description Connect to the private API that gives you information about your orders in real time.
   * @see {@link https://docs.gemini.com/websocket-api/#order-events|order-events}
   */
  connectOrders({ symbolFilter, apiSessionFilter, eventTypeFilter } = {}) {
    if (!this.key || !this.secret) {
      throw new Error('`connectOrders` requires both `key` and `secret`');
    }

    const options = { symbolFilter, apiSessionFilter, eventTypeFilter };
    _checkUndefined(options, true);
    let qs = querystring.stringify(options);
    if (qs) {
      qs = '?' + qs;
    }
    const auth = { key: this.key, secret: this.secret };
    const request = '/v1/order/events';
    const nonce = this._nonce();
    const headers = SignRequest(auth, { request, nonce });
    const uri = this.api_uri + request + qs;

    this.sockets.orders = new Websocket(uri, { headers });
    this._addListeners(this.sockets.orders, 'orders');
  }

  /**
   * @param {Object} [options]
   * @param {string} [options.symbol] - Trading symbol.
   * @example
   * websocket.disconnectMarket({ symbol: 'btcusd' });
   * @description Disconnect from the public API by a given symbol.
   * @see {@link https://docs.gemini.com/websocket-api/#market-data|market-data}
   */
  disconnectMarket({ symbol = this.symbol } = {}) {
    this._checkSocketDisconnect(this.sockets[symbol]);

    this.sockets[symbol].close();
  }

  /**
   * @private
   * @fires WebsocketClient#message
   */
  onMessage(symbol, data) {
    try {
      let message = JSON.parse(data);
      /**
       * @event WebsocketClient#message
       */
      this.emit('message', message, symbol);
    } catch (error) {
      this.onError(symbol, error);
    }
  }

  /**
   * @private
   * @fires WebsocketClient#open
   */
  onOpen(symbol) {
    /**
     * @event WebsocketClient#open
     */
    this.emit('open', symbol);
  }

  /**
   * @private
   * @fires WebsocketClient#close
   */
  onClose(symbol) {
    /**
     * @event WebsocketClient#close
     */
    this.emit('close', symbol);
  }

  /**
   * @private
   * @fires WebsocketClient#error
   */
  onError(symbol, error) {
    if (!error) {
      return;
    }
    /**
     * @event WebsocketClient#error
     */
    this.emit('error', error, symbol);
  }

  /**
   * @private
   * @param socket
   * @param {string} symbol
   */
  _addListeners(socket, symbol) {
    socket.on('message', this.onMessage.bind(this, symbol));
    socket.on('open', this.onOpen.bind(this, symbol));
    socket.on('close', this.onClose.bind(this, symbol));
    socket.on('error', this.onError.bind(this, symbol));
  }

  /**
   * @private
   * @param socket
   */
  _checkSocketConnect(socket) {
    if (socket && socket.readyState !== Websocket.CLOSED) {
      throw new Error('Could not connect (' + socket.readyState + ')');
    }
  }

  /**
   * @private
   * @param socket
   */
  _checkSocketDisconnect(socket) {
    if (!socket || socket.readyState !== Websocket.OPEN) {
      throw new Error('Could not disconnect (not OPEN)');
    }
  }

  /**
   * @private
   * @example
   * const nonce = websocket._nonce();
   * @description Get new nonce.
   */
  _nonce() {
    if (typeof this.nonce === 'function') {
      return this.nonce();
    }
    return (this.nonce = Date.now());
  }
}

module.exports = WebsocketClient;