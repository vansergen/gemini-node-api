const PublicClient = require('./public.js');

class AuthenticatedClient extends PublicClient {
  constructor({ key, secret, ...other }) {
    super(other);
    this._requireProperties(key, secret);

    this.key = key;
    this.secret = secret;
  }
}

module.exports = AuthenticatedClient;
