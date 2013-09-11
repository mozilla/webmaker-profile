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
          // Pre V3 source annotations for FireSass
          dumpLineNumbers: 'mediaquery'
        },
        files: {
          '_fe/compiled/app.debug.css': '_fe/less/main.less'
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          '_fe/compiled/app.min.css': '_fe/less/main.less'
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
        tasks: ['less:development']
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
    nodemon: {
      development: {
        options: {
          file: 'node_modules/webmaker-profile-service/app.js',
          cwd: 'node_modules/webmaker-profile-service/',
          env: {
            PORT: 8080
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-nodemon');

  // Recompile Jade and Less as needed for dev
  grunt.registerTask('default', [
    'less:development',
    'jade:compileJSTemplates',
    'jade:development',
    'connect',
    'nodemon',
    'watch'
  ]);

  // Compile Jade, Less and JS for production
  grunt.registerTask('build', [
    'jshint',
    'less:production',
    'jade:compileJSTemplates',
    'jade:production',
    'requirejs'
  ]);

  grunt.registerTask('heroku', ['build']);

};
