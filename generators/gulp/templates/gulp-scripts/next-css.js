'use strict';
/**
 * css processor with postcss and other plugins
 */
const { gulp } = require('gulp-server-io/gulp');

const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const join = require('path').join;
const config = require('./config');
const dir = join(config.appDir, 'styles');
let processors = [
  autoprefixer({browsers: ['last 1 version']})
];

exports.devTask = () => {
  return gulp.src(join(dir , '*.css'))
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dir));
};

exports.buildTask = () => {
  processors.push(cssnano());
  return gulp.src(join(dir , '*.css'))
    .pipe(postcss(processors))
    .pipe(gulp.dest(dir));
};
