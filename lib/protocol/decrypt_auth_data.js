'use strict';

var _ = require('lodash');
var crypto = require('../util/crypto');
var Promise = require('bluebird');
var sjcl = require('../util/sjcl');
var validate = require('../util/validate');

module.exports = function (params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(decryptAuthData);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("encryptedPasswordHash"))
        .then(validate.present("pin"));
}

function decryptAuthData(params) {
    var key = sjcl.hash.sha256.hash(params.pin);
    params.decryptedPasswordHash = crypto.decryptData(params.encryptedPasswordHash, key);

    return Promise.resolve(_.pick(params, [
        'decryptedPasswordHash'
    ]));
}