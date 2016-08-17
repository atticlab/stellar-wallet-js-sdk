'use strict';

var util = require("util");

Error.subclass = function(errorName) {
  var newError = function(message) {
    this.name    = errorName;
    this.message = (message || "");
  };

  newError.subclass = this.subclass;
  util.inherits(newError, this);

  return newError;
};

var errors = module.exports;

errors.Forbidden =            Error.subclass('Forbidden');
errors.WalletNotFound =       Error.subclass('WalletNotFound');
errors.UsernameAlreadyTaken = Error.subclass('UsernameAlreadyTaken');
errors.InvalidUsername =      Error.subclass('InvalidUsername');
errors.DataCorrupt =          Error.subclass('DataCorrupt');
errors.InvalidField =         Error.subclass('InvalidField');
errors.MissingField =         Error.subclass('MissingField');
errors.TotpCodeRequired =     Error.subclass('TotpCodeRequired');
errors.InvalidTotpCode =      Error.subclass('InvalidTotpCode');
errors.InvalidSignature =     Error.subclass('InvalidSignature');
errors.ConnectionError =      Error.subclass('ConnectionError');
errors.UnknownError =         Error.subclass('UnknownError');

// Own errors
errors.UpdateError = Error.subclass('UpdateError');

errors.getProtocolError = function(code) {
  switch(code) {
    case 'not_found':         return new errors.WalletNotFound('Login/password combination is invalid');
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

    // Invoice server
    case 'empty_required_param':              return new errors.UpdateError('Empty required parameter');
    case 'empty_param_account':               return new errors.UpdateError('Empty parameter: account id');
    case 'empty_param_asset':                 return new errors.UpdateError('Empty parameter: asset');
    case 'empty_param_invoice_id':            return new errors.UpdateError('Empty parameter: invoice id');
    case 'bad_param_amount':                  return new errors.UpdateError('Invalid parameter: amount');
    case 'bad_param_asset':                   return new errors.UpdateError('Invalid parameter: asset');
    case 'bad_param_account':                 return new errors.UpdateError('Invalid parameter: account id');
    case 'bad_param_invoice_id':              return new errors.UpdateError('Invalid parameter: invoice id');
    case 'db_error':                          return new errors.UpdateError('Database error');
    case 'invoice_id_create_error':           return new errors.UpdateError('Can not create invoice id');
    case 'invoice_not_found':                 return new errors.UpdateError('Invoice not found');
    case 'invoice_expired':                   return new errors.UpdateError('Invoice has expired');
    case 'invoice_requested':                 return new errors.UpdateError('Invoice was already requested');
    case 'ip_block':                          return new errors.UpdateError('IP-address is blocked');
    case 'ip_exceeded_minute_limit_misses':   return new errors.UpdateError('IP-address exceeded the minute limit of missed requests');
    case 'ip_exceeded_daily_limit_misses':    return new errors.UpdateError('IP-address exceeded the daily limit of missed requests');
    case 'ip_exceeded_daily_limit_requests':  return new errors.UpdateError('IP-address exceeded the daily limit of requests');
    case 'acc_block':                         return new errors.UpdateError('Account is blocked');
    case 'acc_exceeded_minute_limit_misses':  return new errors.UpdateError('Account exceeded the minute limit of missed requests');
    case 'acc_exceeded_daily_limit_misses':   return new errors.UpdateError('Account exceeded the daily limit of missed requests');
    case 'acc_exceeded_daily_limit_requests': return new errors.UpdateError('Account exceeded the daily limit of requests');
    case 'acc_not_exist':                     return new errors.UpdateError('Account does not exist');

    default: return new errors.UnknownError('Unknown error');
  }
};






