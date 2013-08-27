
var port = process.env.PORT || 5050;
var optimize = process.env.NODE_ENV === 'production';

var express = require('express');
var path = require('path');
var app = express();

// Use caching if we're in production
var cacheSettings = optimize ? { maxAge: '31556952000' } : undefined;

// Use gzip compression
app.use(express.compress());
app.use(express.static(__dirname, cacheSettings));

app.listen(port, function () {
  console.log('Now listening on http://localhost:%d', port);
});
