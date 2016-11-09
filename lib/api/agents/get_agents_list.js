'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.string('company_code', true))
        .then(validate.number('type', true))
        .then(validate.number('limit', true))
        .then(validate.number('offset', true))
        .then(function (params) {
            return self.axios.get('/agents', {
                params: _.pick(params, [
                    'company_code',
                    'type',
                    'limit',
                    'offset'
                ])
            })
        })
};