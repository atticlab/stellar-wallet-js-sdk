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
      .then(sendRequest);
};

function validateParams(params) {
  return Promise.resolve(params)
    .then(validate.present("url"))
    .then(validate.present("keypair"));
}

function sendRequest(params) {
  var resolver = Promise.pending();

  var req_params = {
    publicKey: params.keypair.rawPublicKey().toString('base64')
  };

  crypto.signData(req_params, params.keypair._secretKey);

  request
    .post(params.url)
    .type('json')
    .send(req_params)
    .end(function(err, res) {
      if (err) {
        resolver.reject(new errors.ConnectionError());
      } else {
        resolver.resolve();
      }
    });

  return resolver.promise;
}
