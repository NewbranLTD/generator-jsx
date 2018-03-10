'use strict';
/**
 * collection of other functions
 */
// other import
// const join = require('path').join;
/**
 * Methods to deal with copy and managing assets
 */
const { gulp } = require('gulp-server-io/gulp');
const gulpImageMin = require('gulp-imagemin');

// Create image management functions
exports.imageMin = (files, dest) => {
  return () => {
    return gulp
      .src(files)
      .pipe(gulpImageMin(), { verbose: true })
      .pipe(gulp.dest(dest));
  }
};
