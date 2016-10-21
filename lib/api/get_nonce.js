'use strict';

var errors = require('../errors');

module.exports = function (params) {
    if (this.nonce) {
        return Promise.resolve(params)
    }

    return this.axios.get('/nonce', {
            params: {
                accountId: this.keypair.accountId()
            }
        })
        .then(function () {
            return params;
        });
}
