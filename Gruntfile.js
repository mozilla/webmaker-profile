/*

    Dependencies:

    + npm
    + grunt-cli
        > npm install -g grunt-cli
    + ruby
    + sass gem
        > gem install sass

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
        sass: {
            dist: {
                files: {
                    '_fe/compiled/app.css': '_fe/sass/main.scss'
                }
            },
            dev: {
                options: {
                    style: 'expanded',
                    debugInfo: true
                },
                files: {
                    '_fe/compiled/app.debug.css': '_fe/sass/main.scss'
                }
            }
        },
        cssmin: {
            compress: {
                files: {
                    "_fe/compiled/app.min.css": ["_fe/compiled/app.css"]
                }
            }
        },
        jade: {
            compileJSTemplates: {
                options: {
                    compileDebug: false,
                    client: true,
                    namespace: '<%= pkg.namespace %>.templates',
                    processName: function (filename) {
                        // Remove filepath and extension (_fe/jade/cool.jade -> cool)
                        filename = filename.match(/\/[a-zA-Z\-\.0-9]*(?=\.jade)/)[0].slice(1).toLowerCase();

                        // Remove . and - characters and convert to camelCase
                        return filename.replace(/[\-\.]([a-z])/g, function (g) { return g[1].toUpperCase(); });
                    }
                },
                files: {
                    '_fe/js/<%= pkg.namespace.toLowerCase() %>.templates.js': ["_fe/jade/**/*.jade"]
                }
            },
            createDistIndex: {
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
            createDevIndex: {
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
            sass: {
                files: ['_fe/sass/**/*.scss'],
                tasks: ['sass:dev']
            },
            jade: {
                files: ['_fe/jade/**/*.jade'],
                tasks: ['jade:compileJSTemplates']
            },
            index: {
                files: ['index.jade'],
                tasks: ['jade:createDevIndex', 'jade:createDistIndex']
            },
            js: {
                files: ['_fe/js/**/*.js'],
                tasks: ['jade:createDevIndex', 'jade:createDistIndex']
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
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jade');

    // Recompile Jade and Sass as needed
    grunt.registerTask('default', ['sass:dev', 'jade', 'connect', 'watch']);

    // Compile Jade, Sass and JS
    grunt.registerTask('build', ['sass', 'cssmin', 'jade', 'uglify']);

};
