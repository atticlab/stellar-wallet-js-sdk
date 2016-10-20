'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var request = require('superagent');
var errors = require('../../errors');
var crypto = require('../../util/crypto');
var validate = require('../../util/validate');

var REQ_TIMEOUT = 1000 * 20;

module.exports = function (params) {
  return Promise.resolve(params)
    .then(validateParams)
    .then(sendRequest);
};

function validateParams(params) {
  return Promise.resolve(params)
    .then(validate.present('asset'))
    .then(validate.positiveNumber('amount'))
    .then(validate.memolength('memo'))
}

function sendRequest(params) {
  var resolver = Promise.pending();

  request
    .post(params.server + '/invoice')
    .timeout(REQ_TIMEOUT)
    .type('json')
    .send(_.pick(params, [
      'asset',
      'amount',
      'memo',
    ]))
    .use(crypto.addAuthHeader(params.nonce, params.keypair))
    .end(function(err, res) {
      if (err) {
        resolver.reject(new errors.ConnectionError());
      } else if (typeof res.body.error != 'undefined') {
        resolver.reject(errors.getProtocolError(res.body.error, res.body.message));
      } else {
        resolver.resolve(res.body);
      }
    });

  return resolver.promise;
}
