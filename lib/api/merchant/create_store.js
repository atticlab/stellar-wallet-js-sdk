'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.string('url'))
        .then(validate.string('name'))
        .then(function (params) {
            return self.axios.post('/merchant/stores', _.pick(params, [
                'url',
                'name'
            ]))
        })
};