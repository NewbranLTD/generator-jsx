'use strict';
/**
 * css processor with postcss and other plugins
 */
const gulp = require('gulp');

const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const join = require('path').join;
const config = require('../nb.config.js');

let processors = [
    autoprefixer({browsers: ['last 1 version']})
];

exports.devTask = function()
{
    return gulp.src(
        join(config.yeoman.app , 'styles' , '*.css')
    ).pipe(
        sourcemaps.init()
    ).pipe(
        postcss(processors)
    ).pipe(
        sourcemaps.write('./')
    ).pipe(
        gulp.dest(
            join(config.yeoman.dev , 'styles')
        )
    );
};

exports.buildTask = function()
{
    processors.push(
        cssnano()
    );
    return gulp.src(
        join(config.yeoman.app , 'styles' , '*.css')
    ).pipe(
        postcss(processors)
    ).pipe(
        gulp.dest(
            join(config.yeoman.dest , 'styles')
        )
    );
};
