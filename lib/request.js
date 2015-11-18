// adapted from d3-request
(function (exports) { 'use strict';

  function request(url, callback) {
    var request,
        mimeType,
        headers = {},
        xhr = new XMLHttpRequest,
        response,
        responseType,
        _callback;

    // If IE does not support CORS, use XDomainRequest.
    if (typeof XDomainRequest !== 'undefined'
        && !('withCredentials' in xhr)
        && /^(http(s)?:)?\/\//.test(url)) xhr = new XDomainRequest;

    'onload' in xhr
        ? xhr.onload = xhr.onerror = respond
        : xhr.onreadystatechange = function() { xhr.readyState > 3 && respond(); };

    function respond() {
      var status = xhr.status, result;
      if (!status && hasResponse(xhr)
          || status >= 200 && status < 300
          || status === 304) {
        if (response) {
          try {
            result = response.call(request, xhr);
          } catch (e) {
            _callback(e);
            return;
          }
        } else {
          result = xhr;
        }
        _callback(null, result);
      } else {
        _callback(xhr);
      }
    }

    request = {
      header: function(name, value) {
        name = (name + '').toLowerCase();
        if (arguments.length < 2) return headers[name];
        if (value == null) delete headers[name];
        else headers[name] = value + '';
        return request;
      },

      // If mimeType is non-null and no Accept header is set, a default is used.
      mimeType: function(value) {
        if (!arguments.length) return mimeType;
        mimeType = value == null ? null : value + '';
        return request;
      },

      // Specifies what type the response value should take;
      // for instance, arraybuffer, blob, document, or text.
      responseType: function(value) {
        if (!arguments.length) return responseType;
        responseType = value;
        return request;
      },

      // Specify how to convert the response content to a specific type;
      // changes the callback value on 'load' events.
      response: function(value) {
        response = value;
        return request;
      },

      // Alias for send('GET', …).
      get: function(data, callback) {
        return request.send('GET', data, callback);
      },

      // Alias for send('POST', …).
      post: function(data, callback) {
        return request.send('POST', data, callback);
      },

      // If callback is non-null, it will be used for error and load events.
      send: function(method, data, callback) {
        if (!callback && typeof data === 'function') callback = data, data = null;
        _callback = callback;
        xhr.open(method, url, true);
        if (mimeType != null && !headers['accept']) headers['accept'] = mimeType + ',*/*';
        if (xhr.setRequestHeader) for (var key in headers) xhr.setRequestHeader(key, headers[key]);
        if (mimeType != null && xhr.overrideMimeType) xhr.overrideMimeType(mimeType);
        if (responseType != null) xhr.responseType = responseType;
        xhr.send(data == null ? null : data);
        return request;
      },

      abort: function() {
        xhr.abort();
        return request;
      }
    };

    return callback
        ? request.get(callback)
        : request;
  };

  function hasResponse(xhr) {
    var type = xhr.responseType;
    return type && type !== 'text'
        ? xhr.response // null on error
        : xhr.responseText; // '' on error
  }

  function requestType(defaultMimeType, response) {
    return function(url, callback) {
      var r = request(url).mimeType(defaultMimeType).response(response);
      return callback ? r.get(callback) : r;
    };
  };

  var html = requestType('text/html', function(xhr) {
    return document.createRange().createContextualFragment(xhr.responseText);
  });

  var json = requestType('application/json', function(xhr) {
    return JSON.parse(xhr.responseText);
  });

  var text = requestType('text/plain', function(xhr) {
    return xhr.responseText;
  });

  var xml = requestType('application/xml', function(xhr) {
    return xhr.responseXML;
  });

  exports.request = request;
  exports.html = html;
  exports.json = json;
  exports.text = text;
  exports.xml = xml;

})(window.request = {});