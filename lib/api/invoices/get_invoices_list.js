'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.string('account_id', true))
        .then(validate.number('limit', true))
        .then(validate.number('offset', true))
        .then(function (params) {
            return self.axios.get('/invoices', {
                params: _.pick(params, [
                    'account_id',
                    'limit',
                    'offset'
                ])
            })
        })
};