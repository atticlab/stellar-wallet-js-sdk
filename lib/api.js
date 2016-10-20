'use strict';

var getNonce = require('./api/get_nonce');
var camelCase = require('camel-case');
var validate = require('./util/validate');


function Api(server) {
    this.server = server.replace(/\/+$/g, '');
    this.nonce = null;
}

var methods = [
    'invoice/create_invoice',
    'invoice/get_invoice',
];

_.each(methods, function (path) {

    var method = camelCase(path.split('/').pop());

    Api.prototype[method] = function (p) {
        var self = this;

        if (typeof p != 'object') {
            p = {};
        }

        var params = _.cloneDeep(p);
        params = _.extend(params, _.pick(this, [
            'server',
            'nonce'
        ]));

        return Promise.resolve(params)
            .then(validate.present('server'))
            .then(validate.present('keypair'))
            .then(getNonce.bind(this))
            .then(validate.present('nonce'))
            .then(require('./api/' + path))
            .then(function(resp) {
                self.nonce = resp.nonce;
                return resp;
            });
    }
});

module.exports = Api;