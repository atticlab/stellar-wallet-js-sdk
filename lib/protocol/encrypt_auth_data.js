'use strict';

var _ = require('lodash');
var crypto = require('../util/crypto');
var Promise = require('bluebird');
var sjcl = require('../util/sjcl');
var validate = require('../util/validate');

module.exports = function (params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(encryptAuthData);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("passwordHash"))
        .then(validate.present("pin"));
}

function encryptAuthData(params) {
    var key = sjcl.hash.sha256.hash(params.pin);
    params.encryptedPasswordHash = crypto.encryptData(params.passwordHash, key);

    return Promise.resolve(_.pick(params, [
        'encryptedPasswordHash'
    ]));
}