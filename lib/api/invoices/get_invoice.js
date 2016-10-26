'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (id) {
    var self = this;

    return Promise.resolve(id)
        .then(validate.presentVar(id))
        .then(validate.numberVar(id))
        .then(function (id) {
            return self.axios.get('/invoices/'+id)
        })
};