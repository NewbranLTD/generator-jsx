'use strict';
/**
 * sass standalone task
 */
const { gulp } = require('gulp-server-io/gulp');

const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean-css');
const join = require('path').join;
const apFn = autoprefixer({browsers: ['last 1 version']});
const config = require('./config');
const dir = join(config.appDir, 'styles');
const opt = {};

exports.devTask = () => {
  return gulp.src(join(dir, 'main.scss'))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error' , sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dir))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(apFn)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dir));
};
// build might be good to pass a opt here
exports.buildTask = () => {
  return gulp.src(join(dir , 'main.scss'))
    .pipe(sass(opt).on('error' , sass.logError))
    .pipe(apFn)
    .pipe(clean())
    .pipe(gulp.dest(dir));
};

// -- EOF --
