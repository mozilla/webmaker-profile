module.exports = {
  build: function build(cb) {
    var cwd = process.cwd();
    process.chdir(__dirname);

    var grunt = require('grunt');
    require('./Gruntfile')(grunt);

    grunt.tasks(['build'], { force: true }, function() {
      process.chdir(cwd);

      if (cb) {
        cb();
      }
    });
  }
};
