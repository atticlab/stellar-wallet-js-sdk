'use strict';

var _ = require('lodash');
var camelCase = require('camel-case');
var Promise = require('bluebird');

module.exports = {};

// Add protocol methods
var protocolMethods = [
    'login',
    'create_wallet',
    'get_wallet_data_by_params',
    'encrypt_auth_data',
    'decrypt_auth_data',
    'is_login_exist',
    'change_password',
    'update_main_data',
    'enable_recovery',
    'show_recovery',
    'enable_totp',
    'disable_totp',
    'lost_totp_device',
    'delete_wallet',
    'get_lock_version',
    'send_auth_request',
    'update',
    'sms/get_sms',
    'sms/get_sms_list',
    'sms/check_confirm',
    'sms/create_sms',
    'sms/resend_sms',
    'sms/submit_otp'
];

_.each(protocolMethods, function (method) {
    module.exports[camelCase(method)] = function (params) {
        return Promise.resolve(params)
            .then(require('./' + method));
    }
});