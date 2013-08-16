var connect = require('./node_modules/grunt-contrib-connect/node_modules/connect/lib/connect'),
    path = require('path');

var app = connect();

app.use(connect.static(path.resolve(__dirname)));

var port = process.env.PORT || 5050;

app.listen(port);
console.log("Now listening on port " + port);
