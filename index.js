var grunt = require('grunt');
require('./Gruntfile')(grunt);

module.exports = {
  build: function build(cb) {
    grunt.tasks(['build'], { force: true }, function() {
      cb();
    });
  }
};
