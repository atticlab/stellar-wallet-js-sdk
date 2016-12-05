'use strict';

var _ = require('lodash');
var crypto = require('../util/crypto');
var errors = require('../errors');
var Promise = require('bluebird');
var request = require('superagent');
var validate = require('../util/validate');

module.exports = function (params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(getWalletDataByParams);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.string("email", true))
        .then(validate.string("phone", true));
}

function getWalletDataByParams(params) {
    var resolver = Promise.pending();

    request
        .post(params.server+'/wallets/get_wallet_data')
        .type('json')
        .send(params)
        .end(function(err, res) {
            /* istanbul ignore if */
            if (err) {
                resolver.reject(new errors.ConnectionError());
            } else if (res.body.status === 'fail') {
                resolver.reject(errors.getProtocolError(res.body.code));
            } else {
                var updateData = res.body;
                resolver.resolve(updateData);
            }
        });

    return resolver.promise;
}