'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.present('code'))
        .then(validate.string('title'))
        .then(validate.string('address'))
        .then(validate.present('phone'))
        .then(validate.email('email'))
        .then(function (params) {
            return self.axios.post('/companies', _.pick(params, [
                'code',
                'title',
                'address',
                'phone',
                'email'
            ]))
        })
};