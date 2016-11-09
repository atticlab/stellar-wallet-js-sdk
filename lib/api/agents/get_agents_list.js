'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.number('limit'))
        .then(validate.number('offset'))
        .then(function (params) {
            return self.axios.get('/regusers', {
                params: _.pick(params, [
                    'limit',
                    'offset'
                ])
            })
        })
};