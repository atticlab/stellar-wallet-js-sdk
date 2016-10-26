'use strict';

var _ = require('lodash');
var getNonce = require('./api/get_nonce');
var camelCase = require('camel-case');
var validate = require('./util/validate');
var axios = require('axios');
var crypto = require('./util/crypto');
var errors = require('./errors');

function Api(server, keypair) {
    // Todo: check server and keypair!

    var self = this;

    this.keypair = keypair;
    this.nonce = null;

    this.axios = axios.create();
    this.axios.defaults.baseURL = server.replace(/\/+$/g, '');
    this.axios.defaults.timeout = 2500;

    // Update nonce on return
    this.axios.interceptors.response.use(function (response) {
        if (response.data.nonce) {
            self.nonce = response.data.nonce;
        } else {
            // Somehow nonce didn't arrive - let's ask for new
            self.nonce = false;
        }

        return response;
    }, function (error) {
        self.nonce = null;

        if (error.response && error.response.data) {
            return Promise.reject(errors.getProtocolError(error.response.data.error));
        }

        return Promise.reject(new errors.ConnectionError());
    });

    // Sign request before send
    this.axios.interceptors.request.use(function (config) {
        if (self.nonce) {
            config.headers['Signed-Nonce'] = crypto.addAuthHeader(self.nonce, self.keypair);
        }

        return config;
    });
}

var methods = [
    'invoices/create_invoice',
    'invoices/get_invoice',
    'invoices/get_invoices_list',
    'invoices/make_ban',
    'invoices/get_ban',
    'companies/create_company',
    'companies/get_company',
    'companies/get_companies_list'
];

_.each(methods, function (path) {

    var method = camelCase(path.split('/').pop());

    Api.prototype[method] = function (p) {
        var self = this;

        if ((typeof p != 'undefined')
            && (typeof p != 'number')
            && (typeof p != 'object')) {
            p = {};
        }

        var params = _.cloneDeep(p);

        return Promise.resolve(params)
            .then(getNonce.bind(this))
            .then(require('./api/' + path).bind(this))
            .then(function (resp) {
                // Return data from axios
                return resp.data;
            })
            ;
    }
});

module.exports = Api;