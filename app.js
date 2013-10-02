var express = require('express'),
    path = require('path');

var app = express();

app.use(express.static(path.resolve(__dirname)));

var port = process.env.PORT || 5050;

var grunt = require('grunt');
require('./Gruntfile')(grunt);

grunt.tasks(['build'], { force: true }, function() {
  app.listen(port, function(){
    console.log("Now listening on port " + port);
  });
});
