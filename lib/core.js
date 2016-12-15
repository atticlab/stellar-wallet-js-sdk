'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var protocol = require('./protocol');
var util = {
  crypto: require('./util/crypto'),
  totp: require('./util/totp'),
  keypair: require('./util/keypair')
};
var Wallet = require('./wallet');

function createWalletObject(initData) {
  var wallet = new Wallet(initData);
  return Promise.resolve(wallet);
}

module.exports = {
  errors: require('./errors'),
  Api: require('./api'),
  createWallet: function(p) {
    var params = _.cloneDeep(p);
    return protocol.createWallet(params)
      .then(createWalletObject);
  },
  getWallet: function(p) {
    var params = _.cloneDeep(p);
    return protocol.login(params)
      .then(createWalletObject);
  },
  createFromData: function(initData) {
    return new Wallet(initData);
  },
  getWalletDataByParams: function(p) {
    var params = _.cloneDeep(p);
    return protocol.getWalletDataByParams(params);
  },
  isLoginExist: function(p) {
    var params = _.cloneDeep(p);
    return protocol.isLoginExist(params);
  },
  lostTotpDevice: function(p) {
    var params = _.cloneDeep(p);
    return protocol.lostTotpDevice(params);
  },
  recover: function(p) {
    var params = _.cloneDeep(p);
    return protocol.showRecovery(params);
  },
  updateAdvParams: function(p) {
    var params = _.cloneDeep(p);
    return protocol.updateAdvParams(params);
  },
  util: {
    generateRandomTotpKey: util.totp.generateRandomTotpKey,
    generateRandomRecoveryCode: util.crypto.generateRandomRecoveryCode,
    generateTotpUri: util.totp.generateTotpUri,
    generateKeyPair: util.keypair.generateKeyPair
  }
};
