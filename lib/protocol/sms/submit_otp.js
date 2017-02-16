'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');

var axios = require('./axios_config');

module.exports = function (params) {
    return Promise.resolve(params)
        .then(validate.string('server'))
        .then(validate.string('account_id'))
        .then(validate.string('phone'))
        .then(validate.number('otp'))
        .then(function (params) {
            return axios.post(params.server+'/sms/submitOTP', _.pick(params, [
                'account_id',
                'phone',
                'otp'
            ]))
        })
};