module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        build: {
            all: {
                dest: 'dist/mdsol.js'
            }
        },  
    });

	grunt.loadTasks('build/tasks');

	// Short list as a high frequency watch task
    grunt.registerTask('dev', ['build:*:*']);

	// Default grunt
    grunt.registerTask('default', ['dev']);
};