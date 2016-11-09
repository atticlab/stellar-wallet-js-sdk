'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;
    
    return Promise.resolve(params)
        .then(validate.present('account_id'))
        .then(validate.number('seconds'))
        .then(function (params) {
            return self.axios.post('/invoices/bans', _.pick(params, [
                'account_id',
                'seconds'
            ]))
        })
};