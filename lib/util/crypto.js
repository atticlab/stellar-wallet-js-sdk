'use strict';

var _ = require('lodash');
var base58 = require('bs58');
var crypto = require("crypto");
var errors = require('../errors');
var nacl = require('tweetnacl');
var sjcl = require('./sjcl');
var Promise = require('bluebird');

module.exports = {
    calculateMasterKey: calculateMasterKey,
    bytesToWords: bytesToWords,
    decryptData: decryptData,
    deriveWalletId: generateDeriveFromKeyFunction('WALLET_ID'),
    deriveWalletKey: generateDeriveFromKeyFunction('WALLET_KEY'),
    encryptData: encryptData,
    generateRandomRecoveryCode: generateRandomRecoveryCode,
    sha1: makeHasher('sha1'),
    sha256: makeHasher('sha256'),
    signRequest: signRequest,
    addAuthHeader: addAuthHeader
};

function base64Encode(str) {
    return (new Buffer(str)).toString('base64');
}
function base64Decode(str) {
    return (new Buffer(str, 'base64')).toString();
}

function signRequest(username, walletId, secretKey) {
    return function (request) {
        var rawSecretKey = nacl.util.decodeBase64(secretKey);
        var serializedData = nacl.util.decodeUTF8(JSON.stringify(request._data));
        var signature = nacl.sign.detached(serializedData, rawSecretKey);
        signature = nacl.util.encodeBase64(signature);
        request.set('Authorization', 'STELLAR-WALLET-V2 username="' + username + '", walletId="' + walletId + '", signature="' + signature + '"');
    }
}

function addAuthHeader(request_url, request_data, nonce, keypair) {
    request_data = typeof request_data == 'object'? JSON.stringify(request_data) : '';

    var data = request_url + request_data + nonce;
    var params = [
        nonce,
        nacl.util.encodeBase64(nacl.sign.detached(nacl.util.decodeUTF8(data), keypair.rawSecretKey())),
        keypair.rawPublicKey().toString('base64')
    ];

    return params.join(':');
}

function makeHasher(algo) {
    return function (value) {
        var hasher = crypto.createHash(algo);
        return hasher.update(value).digest("hex");
    };
}

function generateDeriveFromKeyFunction(token) {
    return function (masterKey) {
        var hmac = new sjcl.misc.hmac(masterKey, sjcl.hash.sha256);
        return hmac.encrypt(token);
    };
}

function encryptData(data, key) {
    if (!_.isString(data)) {
        throw new TypeError('data must be a String.');
    }

    var cipherName = 'aes';
    var modeName = 'gcm';

    var cipher = new sjcl.cipher[cipherName](key);
    var rawIV = sjcl.random.randomWords(3);
    var encryptedData = sjcl.mode[modeName].encrypt(
        cipher,
        sjcl.codec.utf8String.toBits(data),
        rawIV
    );

    data = JSON.stringify({
        IV: sjcl.codec.base64.fromBits(rawIV),
        cipherText: sjcl.codec.base64.fromBits(encryptedData),
        cipherName: cipherName,
        modeName: modeName
    });

    return base64Encode(data);
}

function decryptData(encryptedData, key) {
    var rawCipherText, rawIV, cipherName, modeName;

    try {
        var resultObject = JSON.parse(base64Decode(encryptedData));
        rawIV = sjcl.codec.base64.toBits(resultObject.IV);
        rawCipherText = sjcl.codec.base64.toBits(resultObject.cipherText);
        cipherName = resultObject.cipherName;
        modeName = resultObject.modeName;
    } catch (e) {
        new errors.DataCorrupt();
    }

    var cipher = new sjcl.cipher[cipherName](key);
    var rawData = sjcl.mode[modeName].decrypt(cipher, rawCipherText, rawIV);
    return sjcl.codec.utf8String.fromBits(rawData);
}

function parseHexString(str) {
    var result = [];
    while (str.length >= 8) {
        result.push(parseInt(str.substring(0, 8), 16));
        str = str.substring(8, str.length);
    }
    var obj = new Int32Array(result); //It's to take an Int32 values for overloading
    return Object.keys(obj).map(function (key) {
        return obj[key];
    });
}

function utf8StringFromBits(arr) {
    var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
    for (i=0; i<bl/8; i++) {
        if ((i&3) === 0) {
            tmp = arr[i/4];
        }
        out += String.fromCharCode(tmp >>> 24);
        tmp <<= 8;
    }
    return out;
}

function calculateMasterKey(params) {
    var versionBits = sjcl.codec.hex.toBits("0x01");
    var s0Bits = sjcl.codec.base64.toBits(params.salt);
    var usernameBits = sjcl.codec.utf8String.toBits(params.username);
    var unhashedSaltBits = _.reduce([versionBits, s0Bits, usernameBits], sjcl.bitArray.concat);
    var salt = sjcl.hash.sha256.hash(unhashedSaltBits);
    if ((typeof window != 'undefined')
        && (window.plugins != 'undefined')
        && (window.plugins.scrypt != 'undefined')
        && (device != 'undefined')
        && (device.platform != 'undefined')
        && (device.platform != 'browser')
    ) {
        return new Promise(function (resolve, reject) {
            window.plugins.scrypt(
                function (res) {
                    params.rawMasterKey = parseHexString(res);
                    resolve(params);
                },
                function (err) {reject(err);},
                params.password, utf8StringFromBits(salt), {
                    N: params.kdfParams.n,
                    r: params.kdfParams.r,
                    p: params.kdfParams.p,
                    dkLen: params.kdfParams.bits / 8
                }
            );
        });
    } else {
        return new Promise(function (resolve) {
            params.rawMasterKey = sjcl.misc.scrypt(
                params.password,
                salt,
                params.kdfParams.n,
                params.kdfParams.r,
                params.kdfParams.p,
                params.kdfParams.bits / 8
            );
            resolve(params);
        });
    }
}

function generateRandomRecoveryCode() {
    var rawRecoveryKey = nacl.randomBytes(32);
    return base58.encode(new Buffer(rawRecoveryKey));
}

function bytesToWords(bytes) {
    for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
    return words;
}
