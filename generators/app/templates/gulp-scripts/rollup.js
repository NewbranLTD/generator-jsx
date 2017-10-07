'use strict';
/**
 * collection of rollup related scripts
 */
const gulp = require('gulp');
// rollup plugins
const json         = require('rollup-plugin-json');
const babel        = require('rollup-plugin-babel');
const riot         = require('rollup-plugin-riot');
const nodeResolve  = require('rollup-plugin-node-resolve');
const commonJs     = require('rollup-plugin-commonjs');
const includePaths = require('rollup-plugin-includepaths');
const uglify       = require('rollup-plugin-uglify');
const rollupStream = require('rollup-stream');
// stream
const vinylSource  = require('vinyl-source-stream');
const vinylBuffer  = require('vinyl-buffer');
// other plugins
const sourcemaps   = require('gulp-sourcemaps');
const minify       = require('uglify-js').minify;
const path         = require('path');
const join         = path.join;

// 2017-06-06 using bower for vendor
const mainBowerFiles = require('gulp-main-bower-files');
const concat         = require('gulp-concat');
const gulpUglify     = require('gulp-uglify');
const gulpFilter     = require('gulp-filter');
const cleanCSS       = require('gulp-clean-css');

// we are not using the full ES6 import syntax therefore couldn't use the destructure
const nbConfig = require('../nb.config.js');
const yeoman = nbConfig.yeoman;

// rollup cache
var cache;
 /**
  * generate a different build based on the command
  * @param {boolean} build
  */
exports.mainBuild = function(build = false)
{
    const outFile = vinylSource((build) ? 'main.min.js' : 'main.js');
    let plugins = [
        nodeResolve({
            jsnext: true,
            browser: true,
            main: true
        }),
        // this is not working strangely the __commonJs method inject at first run
        // then when the file re-compile the method disappeared.
        commonJs({
            include: join('node_modules','**')
            // ignoreGlobal: true
        }),
        // so we could include file with a relative path
        includePaths({
            include: {},
            paths: [
                yeoman.script
            ] , //nbConfig.includePaths ,
            external: [
                nbConfig.externalLibs
            ],
            extensions: nbConfig.extensions
        }),
        json(),
        riot({debug: false}),
        // 2017-06-26 due to the problem with jest, we use config here and not using the babelrc anymore
        babel({
            exclude: 'node_modules/**',
            babelrc: false,
            presets: [
                ['es2015' , {'modules': false}],
                'stage-0'
            ],
            plugins: [
                'external-helpers'
            ]
        })
    ];
    if (build) {
        plugins.push(
            uglify({}, minify)
        );
    }
    const rollup = rollupStream({
        entry: join(yeoman.script , 'main.js'),
        format: 'iife',
        cache: cache,
        plugins: plugins,
        globals: nbConfig.globalLibs,
       	external: nbConfig.externalLibs,
        sourceMap: false // <-- @BUG the source map never generate correctly!
    });

    if (build) {
        return rollup.pipe(
            outFile
        ).pipe(
            gulp.dest(
                yeoman.scriptDest
            )
        );
    }
    // dev build
    return rollup.pipe(
        outFile
    ).pipe(
        vinylBuffer()
    ).pipe(
        sourcemaps.init({loadMaps: true})
    ).pipe(
        sourcemaps.write('.')
    ).pipe(
        gulp.dest(
            yeoman.scriptDev
        )
    );
};
/**
 * create a vendor rollup files using npm list and take the files out of bower
 *
 */
exports.npmVendorBuild = function(build = false)
{
    const outFile = vinylSource((build) ? 'vendor.npm.min.js' : 'vendor.npm.js');
    const rollup = rollupStream({
        entry: join(yeoman.script , 'vendor.js'),
        sourceMap: false,
        format: 'iife',
        plugins: [
            nodeResolve({
                jsnext: true,
                browser: true,
                main: true
            })
        ]
    });
    // dev build
    return rollup.pipe(
        outFile
    ).pipe(
        vinylBuffer()
    ).pipe(
        gulp.dest(
            yeoman.scriptDev
        )
    );
};

/**
 * good old bower generate vendor file(s)
 */
exports.jsVendorBuild = function()
{
    return gulp.src('./bower.json').pipe(
        mainBowerFiles()
    ).pipe(
        gulpFilter(['**/*.js'])
    ).pipe(
        concat('vendor.min.js')
    /* ).pipe(
        gulpUglify() //uncomment this to do another uglify */
    ).pipe(
        gulp.dest(
            yeoman.scriptDest
        )
    );
};

/**
 * create the css vendor file
 */
exports.cssVendorBuild = function()
{
    return gulp.src('./bower.json').pipe(
        mainBowerFiles()
    ).pipe(
        gulpFilter(['**/*.css'])
    ).pipe(
        concat('vendor.min.css')
    ).pipe(
        cleanCSS()
    ).pipe(
        gulp.dest(
            yeoman.styleDest
        )
    );
};

// -- EOF --
