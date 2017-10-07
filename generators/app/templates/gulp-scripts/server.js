'use strict';
/**
 * all the serve up methods are here
 */
const gulp = require('gulp');
const server = require('gulp-webserver-io');
// other import
const _ = require('lodash');
// variables
const config = require('../nb.config.js');

const defaultConfig = {
    livereload: true ,
    open: true
};

const createServer = (paths , opt) =>
{
    return gulp.src(paths).pipe(server(_.extend({} , defaultConfig , opt)));
}


/**
 * note this one is not going to run inside gulp.series or parallel
 * and it's going to run in a lump
 */
exports.devTask = function(opt = {})
{
    return createServer([
        config.yeoman.dev,
        config.yeoman.node,
        config.yeoman.bower
    ] , opt);
};

// for looking at the build version
exports.buildTask = function(opt = {})
{
    return createServer([
        config.yeoman.dest
    ], opt);
};
