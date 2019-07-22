const wss = require('ws').Server;
const { SignRequest } = require('../../index.js');
const querystring = require('querystring');

const messageLimit = 2;

module.exports = ({ port, key, secret }) => {
  const verifyClient = ({ req }) => {
    const [, , type, _symbol] = req.url.split('/');
    const [symbol] = _symbol.split('?');
    if (type === 'marketdata') {
      return true;
    } else if (type === 'order' && symbol === 'events') {
      const providedSignature = req.headers['x-gemini-signature'];
      const providedKey = req.headers['x-gemini-apikey'];
      const providedPayload = req.headers['x-gemini-payload'];
      const headers = SignRequest({ key, secret }, providedPayload);
      const requiredSignature = headers['X-GEMINI-SIGNATURE'];
      return (
        key &&
        secret &&
        providedSignature === requiredSignature &&
        providedKey === key
      );
    }
    return false;
  };

  const ws = new wss({ port, verifyClient });

  ws.on('connection', (socket, req) => {
    const options = {};
    const [, v, type, path] = req.url.split('/');

    if (v === 'v1') {
      const [symbol, query] = path.split('?');
      const qs = querystring.parse(query);
      if (type === 'marketdata') {
        for (let key of Object.keys(qs)) {
          qs[key] = qs[key] === 'true' ? true : false;
        }
      }
      Object.assign(options, qs);
      for (let i = 0; i < messageLimit; i++) {
        socket.send(JSON.stringify({ symbol, socket_sequence: i, ...options }));
      }
      socket.send(
        JSON.stringify({
          symbol,
          last: true,
          socket_sequence: messageLimit,
          ...options,
        })
      );
    }

    if (v === 'v2') {
      socket.on('message', message => socket.send(message));
    }
  });

  return ws;
};
