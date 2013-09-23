module.exports = function (grunt) {
    'use strict';
    
    var readOptionalJson = function (filepath) {
		    var data = {};
		    try {
		        data = grunt.file.readJSON(filepath);
		    } catch (e) { }
		    return data;
		},
		srcHintOptions = readOptionalJson('src/.jshintrc');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        build: {
            all: {
                dest: 'dist/mdsol.js'
            }
        },

        jshint: {
            src: {
                src: ['src/**/*.js'],
                options: {
                    jshintrc: 'src/.jshintrc'
                }
            },
            dist: {
                src: ['dist/mdsol.js'],
                options: srcHintOptions
            },
            grunt: {
                src: ['Gruntfile.js', 'build/tasks/*'],
                options: {
                    jshintrc: '.jshintrc'
                }
            },
            tests: {
                src: ['test/**/*.js'],
                options: {
                    jshintrc: 'test/.jshintrc'
                }
            }
        },
        
        uglify: {
            all: {
                files: {
                    'dist/mdsol.min.js': ['dist/mdsol.js']
                },
                options: {
                    preserveComments: 'some',
                    sourceMap: 'dist/jquery.min.map',
                    sourceMappingURL: 'jquery.min.map',
                    report: 'min',
                    beautify: {
                        ascii_only: true
                    },
                    compress: {
                        hoist_funs: false,
                        join_vars: true,
                        loops: false,
                        unused: false
                    }
                }
            }
        },
        
        watch: {
            files: ['tests/**/*.html', 'tests/**/*.js'],
            tasks: ['qunit']
        },

        qunit: {
            all: ['tests/**/*.html']
        }
    });

    grunt.loadTasks('build/tasks');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Short list as a high frequency watch task
    grunt.registerTask('dev', ['build:*:*', 'qunit']);

    // Default grunt
    grunt.registerTask('default', ['dev']);
};