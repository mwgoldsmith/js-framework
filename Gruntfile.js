module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        build: {
            all: {
                dest: 'dist/mdsol.js'
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
    grunt.loadNpmTasks('grunt-contrib-watch');

	// Short list as a high frequency watch task
    grunt.registerTask('dev', ['build:*:*', 'qunit']);

	// Default grunt
    grunt.registerTask('default', ['dev']);
};