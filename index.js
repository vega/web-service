var express = require('express');
var querystring = require('querystring');
var requestJSON = require('./requestJSON');
var app = express();

// -- Allow CORS -----
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// -- GitHub OAuth Support -----
var CLIENT_ID = process.env.GITHUB_CLIENT;
var CLIENT_SECRET = process.env.GITHUB_SECRET;
var GH_TOKEN = 'access_token';

function GH_OPTIONS(data) {
  return {
    host: 'github.com',
    port: 443,
    path: '/login/oauth/access_token',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length,
    }
  };
};

app.get('/oauth', function(request, response) {
  response.type('json');
  function onError(msg) {
    response.json({
      token: null,
      error: String(msg)
    });
  }

  // get github access code
  var code = request.query.code;

  if (!code) {
    onError('Missing OAuth code.');
    return;
  }

  var postData = querystring.stringify({
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code:          code
  });

  requestJSON(GH_OPTIONS(postData), postData, function(error, data) {
    if (error) {
      onError(error);
    } else {
      response.json({token: data.json[GH_TOKEN]});
    }
  });
});

// -- Launch Server -----
app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});