'use strict';

var _ = require('lodash');
var getNonce = require('./api/get_nonce');
var camelCase = require('camel-case');
var validate = require('./util/validate');
var axios = require('axios');
var crypto = require('./util/crypto');
var errors = require('./errors');
var queryString = require('query-string');

function Api(server, keypair) {
    if (typeof server != 'string' || !server.length) {
        throw new Error('Cannot use [' + server + '] as server');
    }

    if (typeof keypair == 'undefined' || typeof keypair.accountId != 'function' || typeof keypair.seed != 'function') {
        throw new Error('Keypair is not an instance of StellarSdk.Keypair');
    }

    var self = this;

    this.keypair    = keypair;
    this.nonce      = null;
    this.ttl        = null;
    this.time_live  = null;

    this.axios = axios.create();
    this.axios.defaults.baseURL = server.replace(/\/+$/g, '');
    this.axios.defaults.timeout = 30000;
    this.axios.defaults.paramsSerializer = function(params) {
        return queryString.stringify(params);
    };

    // Update nonce on return
    this.axios.interceptors.response.use(function (response) {
        if (response.data.nonce) {
            self.nonce      = response.data.nonce;
            self.ttl        = response.data.ttl;
            self.time_live  = response.data.ttl;
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

            // For get parameter we need to add data to query
            if (typeof config.params == 'object' && Object.keys(config.params).length) {
                route += (route.indexOf('?') === -1 ? '?' : '&') + queryString.stringify(config.params);
            }

            config.headers['Signature'] = crypto.addAuthHeader(route, config.data, self.nonce, self.keypair);
        }

        return config;
    });
    
    this.decrementTTL = function() {       
        if (self.ttl > 0) {
            self.ttl--;
        }
    };

    this.getNonceTTL = function () {
        return self.ttl;
    };

    this.getTimeLive = function () {
        return self.time_live;
    };

    this.initNonce = function () {
        //self.ttl = 0;
        self.nonce = false;
        var params = _.cloneDeep(self);

        return Promise.resolve(params)
            .then(getNonce.bind(this))
            .then(function(){
                return self.getNonceTTL();
            });

    };

    setInterval(self.decrementTTL, 1000);
}

var methods = [
    'invoices/create_invoice',
    'invoices/get_invoice',
    'invoices/get_invoices_list',    
    'invoices/get_invoices_statistics',
    'companies/create_company',
    'companies/get_company',
    'companies/get_companies_list',
    'regusers/create_reguser',
    'regusers/get_reguser',
    'regusers/get_regusers_list',
    'agents/create_agent',
    'agents/get_agents_list',
    'cards/create_cards',
    'cards/get_card',
    'cards/get_cards_list',
    'merchant/create_store',    
    'merchant/get_stores_list',
    'merchant/get_orders_list',
    'merchant/get_order',
    'enrollments/get_enrollments_list',
    'enrollments/enrollment_accept',
    'enrollments/enrollment_decline',
    'enrollments/enrollment_approve',
    'enrollments/get_user_enrollment',
    'enrollments/get_agent_enrollment',
    'bans/get_bans_list',
    'bans/ban_ip',
    'bans/unban_ip'

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
                Api.ttl = Api.time_live = resp.ttl;
                //Api.time_live   = resp.ttl;
                // Return data from axios
                return resp.data;
            })
            ;
    }
});

module.exports = Api;