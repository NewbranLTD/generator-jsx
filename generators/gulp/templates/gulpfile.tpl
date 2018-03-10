'use strict';
/**
 * top level gulpfile.js for <%= appName %>
 */
const { gulp } = require('gulp-server-io/gulp');
// ours
const gitFn = require('./lib/gulp-scripts/git');
const miscFn = require('./lib/gulp-scripts/misc');
const serverFn = require('./lib/gulp-scripts/server');
// Our gulp scripts
const {
  rollupVendor,
  rollupMain,
  rollupModules
} = require('./lib/gulp-scripts/rollup');
const {
  injectTags,
  gulpInjectTags
} = require('./lib/gulp-scripts/inject');
<% if (devStyle==='sass') { %>
const sassFn = require('./lib/gulp-scripts/sass');
<% } else if (devStyle === 'nextCss') { %>
const cssFn = require('./lib/gulp-scripts/next-css');
<% } else if (devStyle === 'less') { %>
const lessFn = require('./lib/gulp-scripts/less');
<% } else if (devStyle === 'css') { %>
const cssFn = require('./lib/gulp-scripts/css');
<% } %>
const config = require('./lib/config');

  //////////////////////////
  //       DEV TASK       //
  //////////////////////////

gulp.task('vendor', rollupVendor(join('app', 'scripts', 'vendor.js')));
gulp.task('main', rollupMain(join('app', 'scripts', 'app.js')));
// The main rollup
gulp.task('rollup', gulp.parallel('vendor', 'main'));
// When building module export styles
gulp.task('modules', done => {
  rollupModules(join('app', 'scripts', 'modules'));
  done();
});
gulp.task('index', injectTags('app/index.html'));
// Putting them together
gulp.task('dev:scripts', gulp.series('rollup', () => gulpInjectTags()));

gulp.task('dev:serve', done => {
  serverFn.devTask({fallback: '404.html'})
  done();
});

gulp.task('dev', gulp.series(
  'dev:prepare',
  'dev:serve'
));


  ///////////////////////////
  //    BUILD TASK         //
  ///////////////////////////

gulp.task('serve:build', () => serverFn.buildTask());
