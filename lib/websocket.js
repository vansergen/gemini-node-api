const Websocket = require('ws');
const EventEmitter = require('events');

const {
  EXCHANGE_WS_URL,
  SANDBOX_WS_URL,
  DEFAULT_SYMBOL,
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
