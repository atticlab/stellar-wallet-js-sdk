'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.present('id'))
        .then(function (params) {
            return self.axios.get('/invoices/' + params['id'])
        })
};