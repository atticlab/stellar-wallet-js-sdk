'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.string('id'))
        .then(validate.string('token'))
        .then(validate.string('account_id'))
        .then(validate.string('tx_trust'))
        .then(validate.string('login'))
        .then(function (params) {
            return self.axios.post('/enrollments/accept/' + params['id'], _.pick(params, [
                'token',
                'account_id',
                'tx_trust',
                'login'
            ]))
        })
};