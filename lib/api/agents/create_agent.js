'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.string('ipn_code'))
        .then(validate.string('asset'))
        .then(validate.string('surname'))
        .then(validate.string('name'))
        .then(validate.string('middle_name'))
        .then(validate.email('email'))
        .then(validate.string('phone'))
        .then(validate.string('address'))
        .then(validate.string('passport'))
        .then(function (params) {
            return self.axios.post('/reguser', _.pick(params, [
                'ipn_code',
                'asset',
                'surname',
                'name',
                'middle_name',
                'email',
                'phone',
                'address',
                'passport'
            ]))
        })
};