'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var request = require('superagent');
var errors = require('../errors');

var REQ_TIMEOUT = 1000 * 5;

module.exports = function (params) {
  var context = this;

  var resolver = Promise.pending();


  if (params.nonce) {
    resolver.resolve(params)
  } else {
    request.get(params.server + '/nonce')
      .timeout(REQ_TIMEOUT)
      .end(function(err, res) {
        if (err) {
          resolver.reject(new errors.ConnectionError());
        } else if (typeof res.body.error != 'undefined') {
          resolver.reject(errors.getProtocolError(res.body.error));
        } else {
          params.nonce = res.body.nonce;
          context.nonce = res.body.nonce;
          resolver.resolve(params);
        }
      });
  }

  return resolver.promise;
}
