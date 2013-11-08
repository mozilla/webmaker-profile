/*

  Dependencies:

  + npm
  + grunt-cli
    > npm install -g grunt-cli

  Setup:

  > npm install

*/

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      development: {
        options: {
          sourceMap: true,
          sourceMapFilename: '_fe/compiled/app.debug.map',
          sourceMapRootpath: '../../'
        },
        files: {
          '_fe/compiled/app.debug.css': '_fe/less/main.less'
        }
      }
    },
    jade: {
      compileJSTemplates: {
        options: {
          amd: true,
          client: true,
          compileDebug: false,
          // Use only file name sans suffix: foo.jade -> foo
          processName: function (filename) {
            return filename.match(/\/([a-zA-Z0-9\-]*).jade$/)[1];
          }
        },
        files: {
          '_fe/compiled/jade-templates.js': ['_fe/jade/**/*.jade']
        }
      },
      production: {
        options: {
          data: {
            title: '<%= pkg.name %>'
          }
        },
        files: {
          'index.html': 'index.jade'
        }
      },
      development: {
        options: {
          data: {
            title: 'DEV: <%= pkg.name %>',
            dev: true
          }
        },
        files: {
          'index.dev.html': 'index.jade'
        }
      }
    },
    watch: {
      less: {
        files: ['_fe/less/**/*.less'],
        tasks: ['less']
      },
      jade: {
        files: ['_fe/jade/**/*.jade'],
        tasks: ['jade:compileJSTemplates']
      },
      index: {
        files: ['index.jade'],
        tasks: ['jade:development', 'jade:production']
      }
    },
    requirejs: {
      compile: {
        options: {
          optimize: 'uglify2',
          preserveLicenseComments: false,
          baseUrl: './bower_components',
          mainConfigFile: '_fe/js/main.js',
          include: ['main'],
          out: '_fe/compiled/app.min.js'
        }
      }
    },
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 8000
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', '_fe/js/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    jsbeautifier: {
      modify: {
        src: ['Gruntfile.js', '_fe/js/**/*.js'],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      verify: {
        src: ['Gruntfile.js', '_fe/js/**/*.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    cssmin: {
      production: {
        options: {
          keepSpecialComments: 0
        },
        files: {
          '_fe/compiled/app.min.css': ['_fe/compiled/app.debug.css']
        }
      }
    },
    nodemon: {
      development: {
        options: {
          file: 'node_modules/webmaker-profile-service/app.js',
          cwd: 'node_modules/webmaker-profile-service/'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-nodemon');

  // Recompile Jade and Less on filechange for dev
  grunt.registerTask('default', [
    'less',
    'jade',
    'connect',
    'watch'
  ]);

  // Compile Jade, Less and JS for production
  grunt.registerTask('build', [
    'jshint',
    'less',
    'cssmin',
    'jade',
    'requirejs'
  ]);

  // Verify code before a commit
  grunt.registerTask('clean', [
    'jsbeautifier:modify',
    'jshint'
  ]);

  // Build test for Travis
  grunt.registerTask('travis', [
    'jsbeautifier:verify',
    'jshint'
  ]);

  // Alias for automated build on Heroku
  grunt.registerTask('heroku', ['build']);

};
