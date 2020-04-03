const store = new Map();
const uuid = require('uuid/v4');

class Account {
  constructor(id, principalName, givenName, surName) {
    this.pid = id || uuid();
    this.accountUuid = uuid();
    this.principalName = principalName;
    const accountId = this.pid + ':' + principalName;
    this.accountId = accountId;
    this.surName = surName;
    this.givenName = givenName;
    if (!store.get(accountId)) {
      store.set(accountId, this);
      store.set(principalName, this);
    }
  }

  /**
   * @param use - can either be "id_token" or "userinfo", depending on
   *   where the specific claims are intended to be put in.
   * @param scope - the intended scope, while oidc-provider will mask
   *   claims depending on the scope automatically you might want to skip
   *   loading some claims from external resources etc. based on this detail
   *   or not return them in id tokens but only userinfo and so on.
   */
  async claims(use, scope) { // eslint-disable-line no-unused-vars
    return {
      sub: this.principalName,
      pid: this.pid,
      //locale: 'nb',
      //jti: this.principalName + ':' + this.accountUuid,
      "email": this.principalName,
      "given_name": this.givenName,
      "sur_name": this.surName
    };
  }

  static async findById(ctx, id, token) { // eslint-disable-line no-unused-vars
    // token is a reference to the token used for which a given account is being loaded,
    //   it is undefined in scenarios where account claims are returned from authorization endpoint
    // ctx is the koa request context
    if (!store.get(id)) new Account(id, 'anonymous'); // eslint-disable-line no-new
    return store.get(id);
  }
}

module.exports = Account;
