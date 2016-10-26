'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.string('account_id'))
        .then(validate.string('seed')) //sjcl crypted
        .then(validate.string('amount'))
        .then(validate.present('asset'))
        .then(function (params) {
            return self.axios.post('/cards', _.pick(params, [
                'account_id',
                'seed',
                'amount',
                'asset',
            ]))
        })
};