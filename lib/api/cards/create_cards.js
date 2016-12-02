'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.string('tx'))
        .then(validate.string('data'))
        .then(function (params) {
            return self.axios.post('/cards', _.pick(params, [
                'tx',
                'data'
            ]), {timeout: 20000})
        })
};