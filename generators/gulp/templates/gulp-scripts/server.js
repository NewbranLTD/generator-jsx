'use strict';
/**
 * all the serve up methods are here
 */
const { gulp } = require('gulp-server-io/gulp');
const server = require('gulp-webserver-io');
const config = require('./config');

const createServer = (paths , opt) => {
  return gulp.src(paths)
    .pipe(server(opt));
};

/**
 * note this one is not going to run inside gulp.series or parallel
 * and it's going to run in a lump
 */
exports.devTask = (opt = {}) => {
  return createServer([
    config.devPath,
    'node_modules'
  ] , opt);
};

/**
 * serve up the build version 
 */
exports.buildTask = (opt = {}) => {
  return createServer([
    config.destPath
  ], opt);
};
