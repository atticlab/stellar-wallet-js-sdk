'use strict';

var _ = require('lodash');
var errors = require('./errors');
var Promise = require('bluebird');
var validate = require('./util/validate');
var protocol = require('./protocol');

function InvoiceServer(server) {
    var self = this;

    this.server = server.replace(/\/+$/g, '');
}

InvoiceServer.prototype.createInvoice = function (p) {
    var params = _.cloneDeep(p);

    params = _.extend(params, _.pick(this, [
        'server',
    ]));

    var self = this;
    return protocol.createInvoice(params)
        .then(function (resp) {
            return Promise.resolve(resp);
        });
};

InvoiceServer.prototype.getInvoice = function (p) {
    var params = _.cloneDeep(p);

    params = _.extend(params, _.pick(this, [
        'server',
    ]));

    var self = this;
    return protocol.getInvoice(params)
        .then(function (resp) {
            return Promise.resolve(resp);
        });
};

InvoiceServer.prototype.createInvoiceHD = function (p) {
    var params = _.cloneDeep(p);

    params = _.extend(params, _.pick(this, [
        'server',
    ]));

    var self = this;
    return protocol.createInvoiceHd(params)
        .then(function (resp) {
            return Promise.resolve(resp);
        });
};

InvoiceServer.prototype.getInvoiceHD = function (p) {
    var params = _.cloneDeep(p);

    params = _.extend(params, _.pick(this, [
        'server',
    ]));

    var self = this;
    return protocol.getInvoiceHd(params)
        .then(function (resp) {
            return Promise.resolve(resp);
        });
};

module.exports = InvoiceServer;