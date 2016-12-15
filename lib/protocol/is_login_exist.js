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
        .then(isLoginExist);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.string("username"))
}

function isLoginExist(params) {
    var resolver = Promise.pending();

    request
        .post(params.server+'/wallets/is_login_exist')
        .type('json')
        .send(params)
        .end(function(err, res) {
            if (err) {
                resolver.reject(new errors.ConnectionError());
            } else if (res.body.status === 'fail') {
                resolver.reject(errors.getProtocolError(res.body.code));
            } else {
                var response = res.body;
                resolver.resolve(response);
            }
        });

    return resolver.promise;
}