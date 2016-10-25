'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(function (params) {
            return self.axios.get('/cards', {
                params: _.pick(params, [
                    'card_id',
                    'accountId',
                    'agent_accountId',
                    'limit',
                    'page'
                ])
            })
        })
};