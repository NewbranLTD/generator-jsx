/**
 * Row our own to find tag and inject script
 */
const { glob } = require('generator-nodex');
const { gulp } = require('gulp-server-io/gulp');
const gulpReplace = require('gulp-string-replace');
const inject = require('gulp-inject');
const series = require('stream-series');
const path = require('path');
const _ = require('lodash');
const join = path.join;
const parentFile = '/vendor';
const lb = '\r\n';
// Fn
/**
 * @param {array} script
 * @return {string} tags
 */
const scriptTag = script => `<script type="text/javascript" src="${script}" async></script>`;
/**
 * @param {array} css
 * @return {string} tags
 */
const cssTag = css => `<link type="text/css" ref="stylesheet" href="${css}" />`;
/**
 * @param {string} ext file extension
 * @return {function} filter function
 */
const filterFile = ext => file => {
  return file.substring(file.length - ext.length) === ext;
};
/**
 * Search for the list of js / css files
 * @param {string} dir directory to search
 * @return {object} promise - see below
 */
const searchFilesSync = dir => {
  const files = glob.sync(dir + '/**/*.{js,css}');
  return {
    css: files.filter(filterFile('css')),
    js: files.filter(filterFile('js'))
  };
};

/**
 * @param {mixed} files string or array of .html files
 * @param {array} css files to inject above the </head>
 * @param {array} js files to inject above the </body>
 * @return {function} gulp instance
 */
const gulpInject = function(files, css, js, dest) {
  return gulp
    .src(files)
    .pipe(
      gulpReplace(
        /<\/body>/gi,
        ['<!-- injected JS -->', lb + js.map(scriptTag).join(lb), '</body>'].join('')
      )
    )
    .pipe(
      gulpReplace(
        /<\/head>/gi,
        ['<!-- injected CSS -->', lb + css.map(cssTag).join(lb), '</head>'].join('')
      )
    )
    .pipe(gulp.dest(dest));
};
/**
 * Non async await version
 * @param {mixed} files string or array
 * @param {string} path to search for files to inject
 * @param {string} dest where the files go
 */
exports.injectTags = function(files, searchPath = 'dev/scripts', dest = 'dev') {
  dest = dest || searchPath;
  const result = searchFilesSync(searchPath);
  // Order the vendor comes first
  const appJs = result.js.filter(f => f.indexOf(parentFile) > -1);
  const vendorJs = _.difference(result.js, appJs);
  const ignore = a => a.substr(dest.length);
  // Why the order like this and it's correct?
  return () =>
    gulpInject(files, result.css.map(ignore), appJs.concat(vendorJs).map(ignore), dest);
};
// This one throw error about Invalid glob argument
// it was working perfectly fine before!
exports.gulpInjectTags = function() {
  const vendorPath = join('dev', 'scripts', '**', 'vendor*.js');
  const searchPaths = [
    join('dev', 'scripts', '**', '*.js'),
    join('dev', 'styles', '**', '*.css'),
    '!' + vendorPath
  ];
  return gulp
    .src(join('app', 'index.html'))
    .pipe(
      inject(
        series(
          gulp.src(vendorPath, { read: false }),
          gulp.src(searchPaths, { read: false })
        ),
        { ignorePath: 'dev' }
      )
    )
    .pipe(gulp.dest('dev'));
};

/**
 * The main method to call from gulp task
 * @param {mixed} files --> same as gulpInject
 * @param {string} searchPath where the css, js files are
 * @param {string} dest where the files will go
 * @param {function} done (optional) gulp.task callback
 * @return {function} gulp instance
 */
/*
async function injectTagsAsync(files, searchPath, dest = null) {
  try {
    if (dest === null) {
      dest = searchPath;
    }
    const result = await searchFiles(searchPath);
    // We need to fix the order otherwise the browser will complain!
    return () => gulpInject(files, result.css, result.js, dest);
  } catch (e) {
    throw new Error(e);
  }
}
*/
