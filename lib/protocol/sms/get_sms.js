'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');

var axios = require('./axios_config');

module.exports = function (params) {
    return Promise.resolve(params)
        .then(validate.string('server'))
        .then(validate.string('account_id'))
        .then(function (params) {
            return axios.get(params.server+'/sms/' + params['account_id'])
        })
};