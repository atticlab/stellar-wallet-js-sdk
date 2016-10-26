'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (code) {
    var self = this;

    return Promise.resolve(code)
        .then(validate.presentVar(code))
        .then(validate.numberVar(code))
        .then(function (code) {
            return self.axios.get('/companies/'+code)
        })
};