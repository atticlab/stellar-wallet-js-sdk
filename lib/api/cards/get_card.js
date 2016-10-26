'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (account_id) {
    var self = this;

    return Promise.resolve(account_id)
        .then(validate.presentVar(account_id))
        .then(validate.numberVar(account_id))
        .then(function (account_id) {
            return self.axios.get('/cards/'+account_id)
        })
};