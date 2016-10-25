'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;
    
    return Promise.resolve(params)
        .then(validate.string('asset'))
        .then(validate.present('amount'))
        .then(validate.memolength('memo'))
        .then(function (params) {
            return self.axios.post('/invoice', _.pick(params, [
                'asset',
                'amount',
                'memo',
            ]))
        })
};