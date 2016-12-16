'use strict';

var _ = require('lodash');
var common = require('./common');
var crypto = require('../util/crypto');
var errors = require('../errors');
var Promise = require('bluebird');
var request = require('superagent');
var sjcl = require('../util/sjcl');
var validate = require('../util/validate');

module.exports = function (params) {
    var time = new Date().getTime();
    var curTime = new Date().getTime();
    return Promise.resolve(params)
        .then(function (params) {
            time=curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 0,
                'func': 'totpCodeToString',
                'type': 'idle',
                'prevTime': (curTime-time)
            });
        })
        .then(common.totpCodeToString)
        .then(function (params) {
            time=curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 1,
                'func': 'validateParams',
                'type': 'idle',
                'prevTime': (curTime-time)
            });
        })
        .then(validateParams)
        .then(function (params) {
            time=curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 2,
                'func': 'walletShowLoginParams',
                'type': 'request',
                'prevTime': (curTime-time)
            });
        })
        .then(common.walletShowLoginParams)
        .then(function (params) {
            time=curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 3,
                'func': 'ensureTotp',
                'type': 'idle',
                'prevTime': (curTime-time)
            });
        })
        .then(ensureTotp)
        .then(function (params) {
            time=curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 4,
                'func': 'calculateMasterKey',
                'type': 'idle',
                'prevTime': (curTime-time)
            });
        })
        .then(calculateMasterKey)
        .then(function (params) {
            time=curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 5,
                'func': 'calculateWalletId',
                'type': 'idle',
                'prevTime': (curTime-time)
            });
        })
        .then(calculateWalletId)
        .then(function (params) {
            time=curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 6,
                'func': 'walletShow',
                'type': 'request',
                'prevTime': (curTime-time)
            });
        })
        .then(walletShow)
        .then(function (params) {
            time=curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 7,
                'func': 'decryptWallet',
                'type': 'idle',
                'prevTime': (curTime-time)
            });
        })
        .then(decryptWallet)
        .then(function (params) {
            time=curTime;
            curTime = new Date().getTime();
            return common.checkCallBack(params, params.cb, {
                'id': 8,
                'func': 'end',
                'type': 'idle',
                'prevTime': (curTime-time)
            });
        });
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("server"))
        .then(validate.present("username"));
    // TODO require password or masterKey
    //.then(validate.present("password"));
}

function ensureTotp(params) {
    if (params.totpRequired && _.isEmpty(params.totpCode)) {
        return Promise.reject(new errors.TotpCodeRequired);
    }
    return Promise.resolve(params);
}

function calculateMasterKey(params) {
    var t1 = new Date().getTime();
    // We allow to get wallet using password or by providing recovery data: masterKey
    if (params.password) {
        return crypto.calculateMasterKey(params)
            .then(function(params){
                var t2 = new Date().getTime();
                params.endTime = t2-t1;
                return Promise.resolve(params);
            });
    } else {
        params.rawMasterKey = sjcl.codec.base64.toBits(params.masterKey);
        return Promise.resolve(params);
    }
}

function calculateWalletId(params) {
    params.rawWalletId = crypto.deriveWalletId(params.rawMasterKey); // W
    params.rawWalletKey = crypto.deriveWalletKey(params.rawMasterKey); // Kw
    params.walletId = sjcl.codec.base64.fromBits(params.rawWalletId);
    return Promise.resolve(params);
}

function walletShow(params) {
    var resolver = Promise.pending();

    var data = {
        username: params.username,
        walletId: params.walletId
    };

    if (params.totpRequired) {
        data.totpCode = params.totpCode;
    }

    request
        .post(params.server+'/wallets/show')
        .type('json')
        .send(data)
        .end(function(err, res) {
            /* istanbul ignore if */
            if (err) {
                resolver.reject(new errors.ConnectionError());
            } else if (res.body.status === 'fail') {
                resolver.reject(errors.getProtocolError(res.body.code));
            } else {
                params = _.extend(params, _.pick(res.body, ['lockVersion', 'mainData', 'keychainData', 'updatedAt', 'email', 'phone', 'HDW']));
                resolver.resolve(params);
            }
        });

    return resolver.promise;
}

function decryptWallet(params) {
    var wallet = _.pick(params, [
        'server',
        'username',
        'rawMasterKey',
        'rawWalletId',
        'rawWalletKey',
        'rawMainData',
        'rawKeychainData',
        'lockVersion',
        'updatedAt',
        'email',
        'phone',
        'HDW',
        'endTime'
    ]);
    wallet.rawMainData = crypto.decryptData(params.mainData, params.rawWalletKey);
    wallet.rawKeychainData = crypto.decryptData(params.keychainData, params.rawWalletKey);
    wallet.totpEnabled = params.totpRequired;
    return Promise.resolve(wallet);
}