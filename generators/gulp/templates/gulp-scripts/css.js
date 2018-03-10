'use strict';
/**
 * css processor with postcss and other plugins
 */
const { gulp } = require('gulp-server-io/gulp');

const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const concatCss = require('gulp-concat-css');
const join = require('path').join;
const config = require('./config');

exports.buildTask = function()
{
  return gulp.src(join(config.appDir , 'styles' , '*.css'))
    .pipe(sourcemaps.init())
    .pipe(concatCss('bundle.min.css'))
    .pipe(autoprefixer({browsers: ['last 1 version']}))
    .pipe(cleanCss())
    .pipe(sourcemaps.write())
    .pipe(
      gulp.dest(
        join(config.destDir , 'styles')
      )
    );
};
