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
      .then(sendUpdateRequest);
};

function validateParams(params) {
  return Promise.resolve(params)
    .then(validate.present("server"))
    .then(validate.present("walletId"))
    .then(validate.present("username"))
    .then(validate.present("rawWalletKey"))
    .then(validate.present("lockVersion"))
    .then(validate.string("secretKey"));
}

function sendUpdateRequest(params) {
  var resolver = Promise.pending();

  var req_params = params.update;
  req_params.lockVersion = params.lockVersion;

  request
    .post(params.server+'/wallets/update')
    .type('json')
    .send(req_params)
    .use(crypto.signRequest(params.username, params.walletId, params.secretKey))
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
