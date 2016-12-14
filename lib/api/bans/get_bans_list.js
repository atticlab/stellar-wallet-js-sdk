'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.number('limit', true))
        .then(validate.number('offset', true))
        .then(function (params) {
            return self.axios.get('/bans/list', {
                params: _.pick(params, [
                    'limit',
                    'offset'
                ])
            })
        })
};