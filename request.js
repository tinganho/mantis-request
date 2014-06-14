(function(request) {
  "use strict";

  if(typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    module.exports = request;
  }
  else if (typeof define === "function" && define.amd) {
    define(function () {
      return request;
    });
  }
  else {
    window.request = request;
  }
})(function() {
  "use strict";

  /**
   * We wrap all state changing request with a custom X-Reuested-By
   * header to prevent CSRF attacks. We also set a timeout
   *
   * More info: http://www.adambarth.com/papers/2008/barth-jackson-mitchell-b.pdf
   */

  function getRequestObject(method, path, contentType) {
    contentType = ['application/x-www-form-urlencoded', 'multipart/form-data'].indexOf(contentType) !== -1 ? contentType : 'application/json';

    if(cf.DEFAULT_API_URL === 'undefined') {
      throw new TypeError('You must set DEFAULT_API_URL in your configuration');
    }
    var url = /^http/.test(path) ? path : cf[cf.DEFAULT_API_URL.toUpperCase() + '_API_URL'] + path;

    var options = {
      method: method,
      url: url
    };

    if(method !== 'get' && method !== 'head') {
      options.options: { headers: { 'Content-Type' : contentType }};
    }

    var request = new Request(options);
    return request;
  }


  function Request(options) {
    this.method = options.method.toLowerCase();
    this.url = options.url;
    this.options = options.options;
    this.timedOut = false;
    this.completed = false;
    this.successCallback = function() {};
    this.errorCallback = function() {};
    this._lastMethodName = null;
    _.bindAll(this, '_success', '_error');
  }

  /**
   * Simulating the end callback for superagent
   *
   * @param {Function} callback
   * @return {Request}
   * @api public
   */

  Request.prototype.whenSucceeded = function(callback) {
    var _this = this;

    if(cordova) {
      this._request = function() {
        cordova.exec(_this._success, _this._error, 'CORSXHR', 'request', [_this.method, _this.url, _this.options]);
      };
    }
    else {
      this._xhr = new XMLHttpRequest();
      this._request = function() {
        _this._xhr.open(this.method, this.url, true);
        _this._xhr.onreadystatechange = function(e) {
          if(this.readyState == 4 && this.status == 200) {
          }
        };
        _this._xhr.send();
      };
    }

    // We defer this request because we will set the request option
    setTimeout(function() {
      _this._request();
      setTimeout(function() {
        if(!_this.completed) {
          _this.errorCallback('timeout', null);
          _this.timedOut = true;
        }
      }, cf.AJAX_TIMEOUT);
    }, 0);

    this._successCallback = callback;

    return this;
  };

  /**
   * Send fields
   *
   * @param {Object} fields
   * @return {Request}
   * @api public
   */

  Request.prototype.send = function(fields) {
    this.options.fields = fields;

    return this;
  };

  /**
   * Simulating the end callback for superagent
   *
   * @param {Function} callback
   * @return {Request}
   * @api public
   */

  Request.prototype.whenFailed = function(callback) {
    this._errorCallback = callback;

    return this;
  };

  /**
   * Success callback for native bridge
   *
   * @param {String} Request string result
   * @return {void}
   * @delegate
   */

  Request.prototype._success = function(result) {
    if(this.timedOut) {
      return;
    }
    try {
      result = JSON.parse(result);
    }
    catch(error) {
      this._errorCallback('parseError', result);
    }
    if(result.status >= 200 && result.status < 299 || result.status === 304) {
      this._successCallback(result);
    }
    else {
      this._errorCallback('error', result);
    }

    this.completed = true;
  };

  /**
   * Success callback for native bridge
   *
   * @param {String} Request string result
   * @return {void}
   * @delegate
   */

  Request.prototype._error = function(error) {
    this.errorCallback('abort', error);
    this.completed = true;
  };

  Request.prototype.GET = function(path) {
    return getRequestObject('GET', path);
  };

  Request.prototype.POST = function(path, contentType) {
    return getRequestObject('GET', path, contentType);
  };

  Request.prototype.PUT = function(path, contentType) {
    return getRequestObject('GET', path, contentType);
  };

  Request.prototype.PATCH = function(path, contentType) {
    return getRequestObject('GET', path, contentType);
  };

  Request.prototype.DELETE = function(path, contentType) {
    return getRequestObject('GET', path, contentType);
  };

  Request.prototype.HEAD = function(path) {
    return getRequestObject('GET', path);
  };

  Request.prototype.OPTIONS = function(path, contentType) {
    return getRequestObject('GET', path, contentType);
  };

  /**
   * Use cookies on CORS request
   *
   * @return {Request}
   * @api public
   */

  Request.prototype.withCredentials = function() {
    this._xhr.withCredentials = true;

    return this;
  };

  /**
   * Issue a HTTP authentication request
   *
   * @param {String} username
   * @param {String} password
   * @return {Request}
   * @api public
   */

  Request.prototype.withAuthentication = function(username, password) {
    this._username = username;
    this._password = password;

    return this;
  };

  /**
   * Specify HTTP header to use for the request
   *
   * @param {String} name
   * @param {String} value
   * @return {Request}
   * @api public
   */

  Request.prototype.withHeader = function(name, value) {
    this._options.headers[name] = value;

    // Chain with and()
    this.and = this.withHeader;

    return this;
  };

  /**
   * Use query param
   *
   * @param {String} name
   * @param {String} value
   * @return {Request}
   * @api public
   */

  Request.prototype.withQueryParam = function(name, value) {
    this._options.queries[name] = value;

    // Chain with and()
    this.and = this.withHeader;

    return this;
  };

  return function() {
    return new Request();
  }
}));
