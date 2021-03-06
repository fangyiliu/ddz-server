/**
 * Copyright (c) 2015 深圳市辉游科技有限公司.
 */

/**
 * Filter for toobusy.
 * if the process is toobusy, just skip the new request
 */
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var ErrorCode = require('../consts/errorCode');
var utils = require('../util/utils');

var defaultAuthRegExpr = new RegExp("\\.authConn$");
var defaultAuthSessionKey = 'connAuthed';

module.exports = function(opts) {
  return new Filter(opts);
};

var Filter = function(opts) {
  opts = opts || {};
  if (!!opts.authMethod) {
    this.authRegExpr = new RegExp('\\.' + opts.authMethod + '$');
  } else {
    this.authRegExpr = defaultAuthRegExpr;
  }

  this.authSessionKey = opts.authSessionKey || defaultAuthSessionKey;
};

Filter.prototype.before = function(msg, session, next) {
  var sid = session.id;

  if (session.get(this.authSessionKey) != true) {
    if (! this.authRegExpr.test(msg.__route__)) {
      logger.warn('[AuthConnection] reject request msg: ' , msg);
      var err = new Error('Connection not authenticated!');
      err.code = ErrorCode.CONNECTION_NOT_AUTHED;
      next(err, {err: err});
      //session.__sessionService__.kickBySid(session.frontendId, sid);
      utils.kickBySession(session);
      return;
    }
  }

  next();
};

