'use strict';
/**
 * collection of other functions
 */
const gulp = require('gulp');
const eslint = require('gulp-eslint');
// other import
const join = require('path').join;
// variables
const config = require('../nb.config.js');
const yeoman = config.yeoman;

const wiredep = require('wiredep').stream;
const gulpInject = require('gulp-inject');

const series = require('stream-series');
const htmlmin = require('gulp-htmlmin');

const del  = require('del');

// two index.html inject methods

exports.indexDev = function()
{
    const searchPaths = [
        join(yeoman.dev , 'scripts' , '*.js'),
        join(yeoman.dev , 'styles' , '*.css')
    ];
    return gulp.src(
        join(yeoman.app , 'index.html')
    ).pipe(
        wiredep({
            ignorePath: '../bower_components/'
        })
    ).pipe(
        gulpInject(
            gulp.src(searchPaths , {read: false}),
            {ignorePath: yeoman.dev}
        )
    ).pipe(
        gulp.dest(
            yeoman.dev
        )
    );
};

exports.indexBuild = function()
{
    return gulp.src(
        join(yeoman.app , 'index.html')
    ).pipe(
        gulpInject(
            series(
                gulp.src([
                    join(yeoman.scriptDest , 'vendor.npm.min.js'),
                    join(yeoman.scriptDest , 'vendor.min.js'),
                    join(yeoman.styleDest , 'vendor.min.css')
                ]),
                gulp.src([
                    join(yeoman.scriptDest , '*.js'),
                    join(yeoman.styleDest , '*.css'),
                    '!' + join(yeoman.scriptDest , 'vendor.npm.min.js'),
                    '!' + join(yeoman.scriptDest , 'vendor.min.js'),
                    '!' + join(yeoman.styleDest , 'vendor.min.css')
                ] , {read: false})
            ),
            {ignorePath: yeoman.dest}
        )
    ).pipe(
        htmlmin({
            collapseWhitespace: true ,
            removeComments: true
        })
    ).pipe(
        gulp.dest(
            yeoman.dest
        )
    );
};

exports.build404 = function()
{
    return gulp.src(
        join(yeoman.app , '404.html')
    ).pipe(
        gulpInject(
            series(
                gulp.src([
                    join(yeoman.styleDest , 'vendor.min.css')
                ])
            ),
            {ignorePath: yeoman.dest}
        )
    ).pipe(
        gulp.dest(
            yeoman.dest
        )
    );
};

exports.delTask = function(paths)
{
    return (cb) => {
        del(paths).then( () => cb());
    }
};

// linting the scripts
exports.lint = function()
{
    return gulp.src(
        join(yeoman.app , '**' , '*.js')
    ).pipe(
        eslint({
            globals: config.esLintGlobals,
            envs: [
                'browser'
            ]
        })
    ).pipe(
        eslint.format()
    ).pipe(
        eslint.failAfterError()
    );
};
// generate watch task
exports.watchTask = function(path , tasks)
{
    return function() {
        gulp.watch(path , gulp.series(tasks));
    };
};
