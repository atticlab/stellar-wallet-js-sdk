'use strict';

var _ = require('lodash');
var validate = require('../../util/validate');
var crypto = require('../../util/crypto');

module.exports = function (params) {
    var self = this;

    return Promise.resolve(params)
        .then(validate.string('account_id'))
        .then(validate.string('name'))
        .then(validate.string('position'))
        .then(validate.string('comment'))
        .then(function (params) {
            return self.axios.post('/admins', _.pick(params, [
                'account_id',
                'name',
                'position',
                'comment'
            ]))
        })
};