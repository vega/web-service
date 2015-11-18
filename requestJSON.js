var http = require('http');
var https = require('https');

/**
 * HTTP(S) request for JSON data
 * @param options: http options object
 * @param data: optional POST data
 * @param callback: callback to return error, data
 */
module.exports = function(options, data, callback) {
  var prot = options.port == 443 ? https : http;
  var req = prot.request(options, function(response) {
    var output = '';
    response.setEncoding('utf8');

    response.on('data', function (chunk) {
      output += chunk;
    });

    response.on('end', function() {
      try {
        callback(null, JSON.parse(output));
      } catch (err) {
        callback(err, null);
      }
    });
  });

  req.on('error', function(err) {
    callback(err, null);
  });

  if (data) req.write(data);
  req.end();
};