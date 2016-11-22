'use strict';

var _ = require('lodash');
var getNonce = require('./api/get_nonce');
var camelCase = require('camel-case');
var validate = require('./util/validate');
var axios = require('axios');
var crypto = require('./util/crypto');
var errors = require('./errors');

function Api(server, keypair) {
    if (typeof server != 'string' || !server.length) {
        throw new Error('Cannot use [' + server + '] as server');
    }

    if (typeof keypair == 'undefined' || typeof keypair.accountId != 'function' || typeof keypair.seed != 'function') {
        throw new Error('Keypair is not an instance of StellarSdk.Keypair');
    }

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
            return Promise.reject(errors.getProtocolError(error.response.data.error, error.response.data.message || ''));
        }

        return Promise.reject(new errors.ConnectionError());
    });

    // Sign request before send
    this.axios.interceptors.request.use(function (config) {
        if (self.nonce) {
            var route = config.url.substr(config.baseURL.length);
            config.headers['Signature'] = crypto.addAuthHeader(route, config.data, self.nonce, self.keypair);
        }

        return config;
    });
}

var methods = [
    'invoices/create_invoice',
    'invoices/get_invoice',
    'invoices/get_invoices_list',
    'invoices/block_invoices',
    'invoices/get_blocked_invoices_list',
    'companies/create_company',
    'companies/get_company',
    'companies/get_companies_list',
    'regusers/create_reguser',
    'regusers/get_reguser',
    'regusers/get_regusers_list',
    'agents/create_agent',
    'agents/get_agents_list',
    'cards/create_card',
    'cards/get_card',
    'cards/get_cards_list',
    'merchant/create_store',
    'merchant/create_order',
    'merchant/get_stores_list',
    'merchant/get_orders_list',
    'merchant/get_order',
    'enrollments/get_enrollments_list',
    'enrollments/enrollment_accept',
    'enrollments/enrollment_decline',
    'enrollments/enrollment_approve'
];

_.each(methods, function (path) {

    var method = camelCase(path.split('/').pop());

    Api.prototype[method] = function (p) {
        var self = this;

        if (typeof p == 'undefined') {
            p = {};
        }

        if (typeof p != 'object') {
            throw Error('Params must be object');
            return;
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