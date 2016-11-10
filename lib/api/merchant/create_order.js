'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.string('store_id'))
        .then(validate.number('amount'))
        .then(validate.string('currency'))
        .then(validate.present('order_id'))
        .then(validate.string('server_url'))
        .then(validate.string('success_url'))
        .then(validate.string('fail_url'))
        .then(validate.string('signature'))
        .then(validate.string('details', true))
        .then(function (params) {
            return self.axios.post('/merchant/orders', _.pick(params, [
                'store_id',
                'amount',
                'currency',
                'order_id',
                'server_url',
                'success_url',
                'fail_url',
                'signature',
                'details'
            ]))
        })
};