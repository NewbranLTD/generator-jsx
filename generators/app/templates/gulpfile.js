'use strict';
/**
 * generator-rtjs for Riot 3
 * Please note we are using gulp 4 (pre-release version)
 * so you will need to uninstall your glob gulp install
 * npm uninstall -g gulp
 * The following will install locally to your project
 * npm install gulpjs/gulp.git#4.0  --save-dev
 * npm install gulp-cli --save-dev
 * if you require to be able to call this gulpfile.js
 * anywhere with the -C syntax then you need to install
 * gulp-cli globally
 * Also we are not using the full ES2016 JS syntax here
 * to save yet another babel installation
 */
// core import
const path = require('path');
const fs   = require('fs');
const join = path.join;
// gulp
const gulp = require('gulp');
// helpers stuff
const argv = require('yargs').argv;

const gulpFilter = require('gulp-filter');

    ///////////////////////////
    //      PROPERTIES       //
    ///////////////////////////

// we are not using the full ES6 import syntax therefore couldn't use the destructure
const nbConfig = require('./nb.config.js');
// destruction manually just like the old days
const yeoman = nbConfig.yeoman;
// IMPORT FUNCTIONS
const rollupFn = require('./gulp-scripts/rollup.js');
const styleFn = require('./gulp-scripts/<% if (sass) {%>sass<%} else {%>css<%} %>.js');
const miscFn = require('./gulp-scripts/misc.js');
const server = require('./gulp-scripts/server.js');
<% if (useGit) { %>const gitFn = require('./gulp-scripts/git.js'); <% } %>

    ///////////////////////////
    //         DEV           //
    ///////////////////////////

// compile the stuff
gulp.task('dev:rollup' , () => rollupFn.mainBuild());
gulp.task('dev:rollup:vendor' , () => rollupFn.npmVendorBuild());

// serve it up
gulp.task('dev:serve' , () => server.devTask());

// clean it
gulp.task('dev:clean' , miscFn.delTask([
    join(yeoman.dev , '**')
]));

// copy assets task
gulp.task('dev:copy' , () =>
{
    return gulp.src(
        join(yeoman.app , 'assets' , '*' , '*.*')
    ).pipe(
        gulp.dest(yeoman.dev , 'assets')
    );
});
// copy the index.html and transform content if needed
// 2017-06-06 moving it back to use wiredep to keep my sanity
gulp.task('dev:index' , () => miscFn.indexDev() );

// watch them
gulp.task('dev:watch:main' ,
    miscFn.watchTask(
        [
            join(yeoman.app , '**' , '*.js'),
            join(yeoman.app , '**' , '*.tag'),
            join(yeoman.app , '**' , '*.json')
        ], 'dev:rollup'
    )
);

gulp.task('dev:watch:style' ,
    miscFn.watchTask(
        [
            join(yeoman.app , 'styles' , 'main.css')
        ] , 'dev:style'
    )
);

gulp.task('dev:watch:bower' ,
    miscFn.watchTask(
        [
            join(yeoman.app , 'index.html'),
            'bower.json'
        ],'dev:index'
    )
);

gulp.task('dev:watch:assets' ,
    miscFn.watchTask(
        [
            join(yeoman.app , 'assets' , '**' , '*.*')
        ],'dev:copy'
    )
);

gulp.task('dev:watch' , gulp.parallel(
    'dev:watch:main' ,
    'dev:watch:style',
    'dev:watch:bower',
    'dev:watch:assets'
));

// style
gulp.task('dev:style' , () => styleFn.devTask());
// @TODO
// gulp.task('dev:lint' , cb => {});
// build it
gulp.task('dev:build' ,
    gulp.series(
        'dev:clean',
        gulp.parallel(
            // 'dev:rollup:vendor',
            'dev:rollup',
            'dev:style',
            'dev:copy'
        ),
        'dev:index'
    )
);
// top task to call `gulp dev`
gulp.task('dev' , gulp.series('dev:build' , 'dev:serve' , 'dev:watch'));

    ///////////////////////////
    //        BUILD          //
    ///////////////////////////

gulp.task('build:clean' , miscFn.delTask([
    join(yeoman.dev , '**'),
    join(yeoman.dest , '**')
]));

gulp.task('build:style' , () => styleFn.buildTask() );

gulp.task('build:rollup' , () => rollupFn.mainBuild(true) );

gulp.task('build:vendor:js' , () => rollupFn.jsVendorBuild() );

gulp.task('build:vendor:css' , () => rollupFn.cssVendorBuild() );

gulp.task('build:vendor' ,  gulp.parallel('build:vendor:js' , 'build:vendor:css'));

gulp.task('build:copy' , () =>
{
    return gulp.src(
        join(yeoman.app , 'assets' , '**' , '*.*')
    ).pipe(
        gulpFilter(['**/*.md' , '**/*.txt']) // @TODO need to fix this
    ).pipe(
        gulp.dest(
            join(yeoman.assetsDest)
        )
    );
});

gulp.task('build:index' , () => miscFn.indexBuild() );

gulp.task('build:404' , () => miscFn.build404() );

gulp.task('build' ,
    gulp.series(
        'build:clean',
        gulp.parallel(
            'build:rollup',
            'build:vendor',
            'build:copy',
            'build:style'
        ),
        'build:index',
        'build:404'
    )
);

// build and serve up to check
gulp.task('build:check' , gulp.series('build' , () => {
    return server.buildTask();
}));
<% if (useGit) { %>

    ///////////////////////////
    //      GIT TASK         //
    ///////////////////////////

gulp.task('git:init' , gitFn.init);
gulp.task('git:pull' , gitFn.pull);
gulp.task('git:push' , gitFn.push);
gulp.task('git:add' , gitFn.add);
gulp.task('git:commit' , gitFn.commit);
gulp.task('git:tag' , gitFn.tag);
gulp.task('git:bump' , gitFn.verBump);

// this init task will only run once
gulp.task('project:init' , gulp.series(
    'git:init',
    'git:add',
    'git:commit',
    'dev'
));
// release a new version task
gulp.task('project:release' , gulp.series(
    'git:pull', // first pull and merge anything new
    'git:bump', // bump up the version pass --rt patch(default)||minor||major
    'build',
    'git:add',
    'git:tag',
    'git:commit'
    // 'git:push' // uncomment this one when you have set the remote origin
));
<% } %>
// -- EOF --
