'use strict';

var _ = require('lodash');
var errors = require('../errors');
var Promise = require('bluebird');
var request = require('superagent');
var validate = require('../util/validate');

var REQ_TIMEOUT = 1000 * 20;

module.exports = function (params) {
    return Promise.resolve(params)
        .then(validateParams)
        .then(sendRequest);
};

function validateParams(params) {
    return Promise.resolve(params)
        .then(validate.present("server"))
        .then(validate.present("asset"))
        .then(validate.present("mpub"))
        .then(validate.positiveNumber("amount"))
}

function sendRequest(params) {
    var resolver = Promise.pending();

    request
        .post(params.server+'/api/hd/add')
        .timeout(REQ_TIMEOUT)
        .type('json')
        .send(_.pick(params, [
            'asset',
            'mpub',
            'amount'
        ]))
        .end(function(err, res) {
            if (err) {
                resolver.reject(new errors.ConnectionError());
                // } else if (res.body.status === 'fail') {
            } else if (typeof res.body.error != 'undefined') {
                resolver.reject(errors.getProtocolError(res.body.error));
            } else {
                resolver.resolve(res.body);
            }
        });

    return resolver.promise;
}
