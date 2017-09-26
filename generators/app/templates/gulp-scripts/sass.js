'use strict';
/**
 * sass standalone task
 */
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean-css');
const join = require('path').join;
const config = require('../nb.config.js');

const apFn = autoprefixer({browsers: ['last 1 version']});

exports.devTask = function()
{
    return gulp.src(
        join(config.yeoman.app , 'styles' , 'main.scss')
    ).pipe(
        sourcemaps.init()
    ).pipe(
        sass().on('error' , sass.logError)
    ).pipe(
        sourcemaps.write()
    ).pipe(
        gulp.dest(config.yeoman.app , 'styles')
    ).pipe(
        sourcemaps.init({loadMaps: true})
    ).pipe(
        apFn
    ).pipe(
        sourcemaps.write('./')
    ).pipe(
        gulp.dest(config.yeoman.app , 'styles')
    );
};

exports.buildTask = function()
{
    return gulp.src(
        join(config.yeoman.app , 'styles' , 'main.scss')
    ).pipe(
        sass(opts).on('error' , sass.logError)
    ).pipe(
        apFn
    ).pipe(
        clean()
    ).pipe(
        gulp.dest(config.yeoman.dest , 'styles')
    )
};

// -- EOF --
