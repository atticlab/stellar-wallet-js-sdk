'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.string('ipn_code', true))
        .then(validate.string('passport', true))
        .then(validate.string('phone', true))
        .then(validate.email('email', true))
        .then(function (params) {
            return self.axios.get('/reguser', {
                params: _.pick(params, [
                    'passport',
                    'ipn_code',
                    'email',
                    'phone'
                ])
            })
        })
};