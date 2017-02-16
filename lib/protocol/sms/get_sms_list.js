'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');

var axios = require('./axios_config');

module.exports = function (params) {
    return Promise.resolve(params)
        .then(validate.string('server'))
        .then(validate.number('limit', true))
        .then(validate.number('offset', true))
        .then(function (params) {
            return axios.get(params.server+'/sms', {
                params: _.pick(params, [
                    'limit',
                    'offset'
                ])
            })
        })
};