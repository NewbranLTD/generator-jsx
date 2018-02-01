/**
 * Rollup
 */
const { gulp } = require('gulp-server-io/gulp');
const { glob, when } = require('generator-nodex');
// Rollup plugins
const includePaths = require('rollup-plugin-includepaths');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonJs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const rollupStream = require('rollup-stream');
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');
const riot = require('rollup-plugin-riot');
// Stream
const vinylSource = require('vinyl-source-stream');
const vinylBuffer = require('vinyl-buffer');
// Other plugins
// const sourcemaps = require('gulp-sourcemaps');
// const minify = require('uglify-js').minify;
const path = require('path');
const join = path.join;
const _ = require('lodash');

const config = require('./config');

/**
  Something worth noting:
  I think rollup abandon the idea of main:jsnext tag
  and using the npm recommend (?) module

  So now we have

  main --> cjs
  module --> esm
  browser --> umd

  plus rollup now capable to output all of these files
  at the same time.
 **/
let externals = [];
// if you have additional global available then you can add here
let globals = config.globals;

_.forEach(globals, value => {
  externals.push(value);
});
// files extension that we capture
const extensions = ['.js', '.json', '.tag'];
// inline babel config instead of babel.rc file
const babelConfig = {
  exclude: 'node_modules/**',
  babelrc: false,
  presets: [
    [
      'env',
      {
        targets: {
          browsers: ['last 2 versions', 'ie >= 9']
        },
        modules: false
      }
    ]
  ],
  plugins: ['external-helpers']
};

/**
 * This is the mini version that only deal with the vendor file
 * which we don't need much
 * @param {string} entry - the main file
 * @param {string} outputDir (note) we put the in scritps/vendor for injection ordering
 * @param {boolean} compress where to minify the output or not (default: false)
 */
exports.rollupVendor = function(entry, outputDir = 'dev/scripts', compress = false) {
  const info = path.parse(entry);
  // Need to strip out the bloody path here!
  const outFile = vinylSource(info.name + (compress ? '.min' : '') + info.ext);
  let plugins = [
    commonJs({
      include: join('node_modules', '**')
    }),
    nodeResolve({
      browser: true,
      main: true
    })
  ];
  if (compress) {
    plugins.push(uglify());
  }
  return () => {
    return rollupStream({
      input: entry,
      format: 'umd',
      plugins: plugins
    })
      .pipe(outFile)
      .pipe(vinylBuffer())
      .pipe(gulp.dest(outputDir));
  };
};

/**
 * @param {object} params config
 * @return {array} plugins
 */
const getPlugins = function(params) {
  let plugins = [
    nodeResolve({
      browser: true,
      main: true
    }),
    // This is not working strangely the __commonJs method inject at first run
    // then when the file re-compile the method disappeared.
    commonJs({
      // Include: join('node_modules', '**'),
      ignoreGlobal: true
    }),
    // So we could include file with a relative path
    includePaths({
      include: {},
      paths: [params.scriptsPath], // NbConfig.includePaths ,
      external: [params.externals],
      extensions: params.extensions
    }),
    json(),
    riot(),
    // 2017-06-26 due to the problem with jest, we use config here and not using the babelrc anymore
    babel(params.babelConfig)
  ];
  if (params.build) {
    plugins.push(uglify());
  }
  return plugins;
};

/**
 * @2017-11-05 this use the parameters to determine what to do
 * i.e. we create our own split in this way to look at just
 * the export (index.js) file instead of an main file
 * @param {string} entry - the main entry file
 * @param {string} output - the output file
 * @param {object} params (optional) extra params to work with
 * @return {object} gulp stream
 */
const rollupFn = function(entry, output, params = {}) {
  // Strip out the js file extension from the output
  const outFile = vinylSource(output);
  const plugins = getPlugins(_.extend({}, params, { babelConfig }));
  const rollup = rollupStream({
    input: entry,
    format: 'iife', // Umd?
    plugins: plugins,
    globals: params.globals,
    external: params.externals,
    sourcemap: false // <-- @BUG the source map never generate correctly!
  });

  if (params.build) {
    return rollup.pipe(outFile).pipe(gulp.dest(params.dest));
  }
  // Dev build
  return (
    rollup
      .pipe(outFile)
      .pipe(vinylBuffer())
      // .pipe(sourcemaps.init({ loadMaps: true }))
      // .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(params.dest))
  );
};

/**
 * find the top level export file (index.js) in a module folder
 * @param {string} dir directory to start the search
 * @return {object} promise
 */
const searchModuleJs = function(dir) {
  return when.promise((resolver, rejecter) => {
    glob(join(dir, '**', 'index.js'), (err, files) => {
      if (err) {
        return rejecter(err);
      }
      resolver(files);
    });
  });
};

/**
 * Wrap the above method with configuration from here (or elsewhere)
 * and export it for use in gulpfile
 * @param {string} entry the entry js file
 * @param {string} dest where to go
 * @return {function} callback
 */
exports.rollupMain = function(entry, dest) {
  const params = {
    globals,
    externals,
    extensions,
    scriptsPath: join('app', 'scripts'),
    dest: dest || join('dev', 'scripts')
  };
  return () => rollupFn(entry, 'bundle.js', params);
};
