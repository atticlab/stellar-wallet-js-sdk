'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (ipn_code) {
    var self = this;

    return Promise.resolve(ipn_code)
        .then(validate.presentVar(ipn_code))
        .then(function (ipn_code) {
            return self.axios.get('/regusers/'+ipn_code)
        })
};