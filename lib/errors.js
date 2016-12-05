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
        case 'ERR_BAD_SIGN':      return new errors.ApiError('Invalid signature', msg);
        case 'ERR_BAD_TYPE':      return new errors.ApiError('Invalid user type for this operation', msg);
        case 'ERR_NOT_FOUND':     return new errors.ApiError('Record is not found', msg);
        case 'ERR_ALREADY_EXISTS':return new errors.ApiError('Record already exists', msg);
        case 'ERR_INV_EXPIRED':   return new errors.ApiError('This invoice is expired', msg);
        case 'ERR_INV_REQUESTED': return new errors.ApiError('This invoice is already requested', msg);
        case 'ERR_BAD_PARAM':     return new errors.ApiError('Bad parameter', msg);
        case 'ERR_EMPTY_PARAM':   return new errors.ApiError('Needle parameter is not present', msg);
        case 'ERR_SERVICE':       return new errors.ApiError('Service error', msg);
        case 'ERR_ACC_BLOCKED':   return new errors.ApiError('Account is blocked!', msg);

        default: return new errors.UnknownError('Unknown error');
    }
};






