/*

    Dependencies:

    + npm
    + grunt-cli
        > npm install -g grunt-cli

    Setup:

    > npm install

*/

module.exports = function (grunt) {
    var pkg = grunt.file.readJSON('package.json'),
        scripts;

    // Scripts to uglify and include (in load-order)
    scripts = grunt.file.expand('_fe/js/lib/*.js',
                                '_fe/js/' + pkg.namespace.toLowerCase() + '.*.js'); // All namespace prefixed JS files

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\n'
            },
            build: {
                src: scripts,
                dest: '_fe/compiled/app.min.js'
            }
        },
        less: {
            development: {
                options: {
                    paths: ['_fe/less'],
                    // Old fashioned source annotations
                    // Works w. FireSass+Firebug
                    dumpLineNumbers: 'mediaquery'
                },
                files: {
                    '_fe/compiled/app.debug.css': '_fe/less/main.less'
                }
            },
            production: {
                options: {
                    paths: ['_fe/less/'],
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
                    // Convert hyphen-case to camelCase
                    processName: function (filename) {
                        filename = filename.match(/\/[a-zA-Z\-\.0-9]*(?=\.jade)/)[0].slice(1).toLowerCase();
                        return filename.replace(/[\-\.]([a-z])/g, function (g) { return g[1].toUpperCase(); });
                    }
                },
                files: {
                    '_fe/js/templates.js': ["_fe/jade/**/*.jade"]
                }
            },
            production: {
                options: {
                    pretty: true,
                    data: {
                        title: '<%= pkg.name %>',
                        scripts: ['_fe/compiled/app.min.js']
                    }
                },
                files: {
                    'index.html': 'index.jade'
                }
            },
            development: {
                options: {
                    pretty: true,
                    data: {
                        title: 'DEV: <%= pkg.name %>',
                        dev: true,
                        scripts: scripts
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
            },
            // New JS files are auto-added to the indexes
            js: {
                files: ['_fe/js/**/*.js'],
                tasks: ['jade:development', 'jade:production']
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jade');

    // Recompile Jade and Less as needed
    grunt.registerTask('default', ['less:development', 'jade', 'connect', 'watch']);

    // Compile Jade, Less and JS
    grunt.registerTask('build', ['less:production', 'jade', 'uglify']);

};
