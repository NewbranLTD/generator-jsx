/**
 * bunch of watch related taskes
 */
const { gulp } = require('gulp-server-io/gulp');
const join = require('path').join;
const config = require('./config');
const { imageMin } = require('./misc');
const {
  rollupVendor,
  rollupMain,
  rollupModules
} = require('./rollup');
<% if (devStyle==='sass') { %>
const sassFn = require('./sass');
<% } else if (devStyle === 'nextCss') { %>
const cssFn = require('./next-css');
<% } else if (devStyle === 'less') { %>
const lessFn = require('./less');
<% } else if (devStyle === 'css') { %>
const cssFn = require('./css');
<% } %>

// watch js / tag change
exports.watchScript = () => {
  gulp.watch(join(config.scriptDir, '**', '*.{js,tag,md,json}') , () => {
    // do the rollup thing
  });
};

// watch the asset folder
exports.watchAssets = () => {
  const dir = join(config.appDir, 'assets', '**', '*.{jpg,jpeg,png,gif,svg}');
  const dest = join(config.devDir, 'assets');
  const others = [
    join(config.appDir, 'assets', '**', '*.*'),
    '!' + dir
  ];
  gulp.watch(dir, imageMin(dir, dest));
  gulp.watch(others, () => {
    return gulp.src(others)
      .pipe(gulp.dest(dest));
  });
};

// watch the <%= devStyle %> change
exports.watchStyle = () => {
  gulp.watch(join(config.styleDir, '**', '*.{<%= styleExt %> }', () => {
    // do your styling thing here 
  });
};
