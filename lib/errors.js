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
    case 'not_found':         return new errors.WalletNotFound();
    case 'already_taken':     return new errors.UsernameAlreadyTaken();
    case 'invalid_username':  return new errors.InvalidUsername();
    case 'invalid_totp_code': return new errors.InvalidTotpCode();
    case 'invalid_signature': return new errors.InvalidSignature();
    case 'forbidden':         return new errors.Forbidden();

    // Own errors
    case 'bad_param_phone':   return new errors.UpdateError('Invalid parameter: phone');
    case 'bad_param_email':   return new errors.UpdateError('Invalid parameter: email');
    case 'phone_exists':      return new errors.UpdateError('User with this phone exists');
    case 'email_exists':      return new errors.UpdateError('User with this email exists');
    case 'nothing_to_update': return new errors.UpdateError('Nothing to update');

    default:                  return new errors.UnknownError();
  }
};






