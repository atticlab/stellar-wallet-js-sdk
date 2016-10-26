'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (card_id) {
    var self = this;

    return Promise.resolve(card_id)
        .then(validate.presentVar(card_id))
        .then(validate.numberVar(card_id))
        .then(function (card_id) {
            return self.axios.get('/cards/'+card_id)
        })
};