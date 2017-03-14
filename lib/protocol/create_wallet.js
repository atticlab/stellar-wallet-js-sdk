'use strict';

var _ = require('lodash');
var common = require('./common');
var crypto = require('../util/crypto');
var errors = require('../errors');
var nacl = require('tweetnacl');
var Promise = require('bluebird');
var request = require('superagent');
var sjcl = require('../util/sjcl');
var validate = require('../util/validate');

module.exports = function (params) {
    var time = new Date().getTime();
    var curTime = new Date().getTime();
    return Promise.resolve(params)
        .then(function (params) {
            time = curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 0,
                'func': 'validateParams',
                'type': 'procedure',
                'prevTime': (curTime - time)
            });
        })
        .then(validateParams)
        .then(function (params) {
            time = curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 1,
                'func': 'isLoginExist',
                'type': 'request',
                'prevTime': (curTime - time)
            });
        })
        .then(isLoginExist)
        .then(function (params) {
            time = curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 2,
                'func': 'getKdfParams',
                'type': 'procedure',
                'prevTime': (curTime - time)
            });
        })
        .then(common.getKdfParams)
        .then(function (params) {
            time = curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 3,
                'func': 'generateSalt',
                'type': 'procedure',
                'prevTime': (curTime - time)
            });
        })
        .then(generateSalt)
        .then(function (params) {
            time = curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 4,
                'func': 'calculatePassword',
                'type': 'procedure',
                'prevTime': (curTime - time)
            });
        })
        .then(calculatePassword)
        .then(function (params) {
            time = curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 5,
                'func': 'calculateMasterKey',
                'type': 'procedure',
                'prevTime': (curTime - time)
            });
        })
        .then(calculateMasterKey)
        .then(function (params) {
            time = curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 6,
                'func': 'prepareDataToSend',
                'type': 'procedure',
                'prevTime': (curTime - time)
            });
        })
        .then(prepareDataToSend)
        .then(function (params) {
            time = curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 7,
                'func': 'sendWalletCreateRequest',
                'type': 'request',
                'prevTime': (curTime - time)
            });
        })
        .then(sendWalletCreateRequest);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("server"))
        .then(validate.present("username"))
        .then(validate.present("password"))
        .then(validate.present("accountId"))
        .then(validate.string("publicKey"))
        .then(validate.string("mainData"))
        .then(validate.string("keychainData"));
}


function isLoginExist(params) {
    var resolver = Promise.pending();

    request
        .post(params.server+'/wallets/is_login_exist')
        .type('json')
        .send(_.pick(params, [
            'username'
        ]))
        .end(function(err, res) {
            if (err) {
                resolver.reject(new errors.ConnectionError());
            } else if (res.body.status === 'fail') {
                resolver.reject(errors.getProtocolError(res.body.code));
            } else {
                resolver.resolve(params);
            }
        });

    return resolver.promise;
}

function generateSalt(params) {
    params.salt = nacl.util.encodeBase64(nacl.randomBytes(16)); // S0
    return Promise.resolve(params);
}

function calculatePassword(params) {
    return crypto.calculatePassword(params)
        .then(function (params) {
            return Promise.resolve(params);
        })
}

function calculateMasterKey(params) {
    var t1 = new Date().getTime();
    return crypto.calculateMasterKey(params) //S0
        .then(function (params) {
            var t2 = new Date().getTime();
            params.endTime = t2 - t1;
            return Promise.resolve(params);
        });
}

function prepareDataToSend(params) {
    var walletId = crypto.deriveWalletId(params.rawMasterKey); // W
    var walletKey = crypto.deriveWalletKey(params.rawMasterKey); // Kw

    params.kdfParams = JSON.stringify(params.kdfParams);

    params.rawWalletId = walletId;
    params.walletId = sjcl.codec.base64.fromBits(walletId);

    params.rawWalletKey = walletKey;

    params.rawMainData = params.mainData;
    params.mainData = crypto.encryptData(params.mainData, walletKey);
    params.mainDataHash = crypto.sha1(params.mainData);

    params.rawKeychainData = params.keychainData;
    params.keychainData = crypto.encryptData(params.keychainData, walletKey);
    params.keychainDataHash = crypto.sha1(params.keychainData);

    return Promise.resolve(params);
}

function sendWalletCreateRequest(params) {
    var resolver = Promise.pending();

    var route = params.phoneAsLogin ? '/wallets/createphone' : '/wallets/create';

    request
        .post(params.server + route)
        .type('json')
        .send(_.pick(params, [
            'username',
            'walletId',
            'accountId',
            'salt',
            'publicKey',
            'mainData',
            'mainDataHash',
            'keychainData',
            'keychainDataHash',
            'kdfParams',
            // Hack for stellar-wallet run by SDF to allow transition from V1 wallet
            // https://github.com/stellar/stellar-wallet/issues/34
            'usernameProof'
        ]))
        .end(function (err, res) {
            /* istanbul ignore if */
            if (err) {
                resolver.reject(new errors.ConnectionError());
            } else if (res.body.status === 'fail') {
                resolver.reject(errors.getProtocolError(res.body.code));
            } else {
                var wallet = _.pick(params, [
                    'server',
                    'username',
                    'accountId',
                    'rawMasterKey',
                    'rawWalletId',
                    'rawWalletKey',
                    'rawMainData',
                    'rawKeychainData',
                    'passwordHash'
                ]);
                wallet.lockVersion = 0;
                wallet.totpEnabled = false;
                resolver.resolve(wallet);
            }
        });

    return resolver.promise;
}
