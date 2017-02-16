'use strict';

var util = require("util");

Error.subclass = function(errorName) {
  var newError = function(message, descr) {
    this.name    = errorName;
    this.message = (message || "");
    this.description = (descr || "");
  };

  newError.subclass = this.subclass;
  util.inherits(newError, this);

  return newError;
};

var errors = module.exports;

errors.Forbidden =              Error.subclass('Forbidden');
errors.WalletNotFound =         Error.subclass('WalletNotFound');
errors.UsernameAlreadyTaken =   Error.subclass('UsernameAlreadyTaken');
errors.InvalidUsername =        Error.subclass('InvalidUsername');
errors.DataCorrupt =            Error.subclass('DataCorrupt');
errors.InvalidField =           Error.subclass('InvalidField');
errors.MissingField =           Error.subclass('MissingField');
errors.TotpCodeRequired =       Error.subclass('TotpCodeRequired');
errors.InvalidTotpCode =        Error.subclass('InvalidTotpCode');
errors.InvalidSignature =       Error.subclass('InvalidSignature');
errors.ConnectionError =        Error.subclass('ConnectionError');
errors.UnknownError =           Error.subclass('UnknownError');

// Own errors
errors.UpdateError =            Error.subclass('UpdateError');

// API errors
errors.ApiError =               Error.subclass('ApiError');

errors.getProtocolError = function(code, msg) {

    if (typeof msg == 'undefined') {
        msg = '';
    }

    switch(code) {
        case 'not_found':         return new errors.WalletNotFound('Not found');
        case 'wallet_not_found':  return new errors.WalletNotFound('Login/password combination is invalid');
        case 'already_taken':     return new errors.UsernameAlreadyTaken('Username already exists');
        case 'invalid_username':  return new errors.InvalidUsername('Invalid username');
        case 'invalid_totp_code': return new errors.InvalidTotpCode('Invalid TOTP code');
        case 'invalid_signature': return new errors.InvalidSignature('Invalid signature');
        case 'forbidden':         return new errors.Forbidden('Forbidden');

        // Own errors
        case 'bad_param_phone':   return new errors.UpdateError('Invalid parameter: phone');
        case 'bad_param_email':   return new errors.UpdateError('Invalid parameter: email');
        case 'phone_exists':      return new errors.UpdateError('User with this phone exists');
        case 'email_exists':      return new errors.UpdateError('User with this email exists');
        case 'nothing_to_update': return new errors.UpdateError('Nothing to update');

        // API errors
        case 'ERR_UNKNOWN':       return new errors.ApiError('Unknown error. Please, contact support', msg);
        case 'ERR_BAD_SIGN':      return new errors.ApiError('Invalid signature', msg);
        case 'ERR_BAD_TYPE':      return new errors.ApiError('Invalid user type for this operation', msg);
        case 'ERR_NOT_FOUND':     return new errors.ApiError('Record is not found', msg);
        case 'ERR_ALREADY_EXISTS':return new errors.ApiError('Record already exists', msg);
        case 'ERR_INV_EXPIRED':   return new errors.ApiError('This invoice is expired', msg);
        case 'ERR_INV_REQUESTED': return new errors.ApiError('This invoice is already requested', msg);
        case 'ERR_BAD_PARAM':     return new errors.ApiError('Bad parameter', msg);
        case 'ERR_EMPTY_PARAM':   return new errors.ApiError('Needed parameter is not present', msg);
        case 'ERR_SERVICE':       return new errors.ApiError('Service error', msg);
        case 'ERR_IP_BLOCKED':    return new errors.ApiError('IP is blocked', msg);
        case 'ERR_TX':            return new errors.ApiError('Horizon transaction error', msg);

        //SMS errors
        case 'ERR_TOO_MANY_ACCS':   return new errors.ApiError('Too many accounts on this phone number', msg);
        case 'ERR_SMS_NO_FUNDS':    return new errors.ApiError('SMS service error', msg);
        case 'ERR_SMS_SEND':        return new errors.ApiError('SMS sending error', msg);
        case 'ERR_OTP_TTL':         return new errors.ApiError('Password expired. Please, try to resend', msg);
        case 'ERR_ALREADY_TAKEN':   return new errors.ApiError('This account is already in use', msg);

        default: return new errors.UnknownError('Unknown error');
    }
};






