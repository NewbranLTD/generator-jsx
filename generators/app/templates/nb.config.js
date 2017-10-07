'use strict';
/**
 * configuration for internal use see different section for more details
 */
const path = require('path');
const join = path.join;
const extensions = ['.js' , '.json' , '.tag'];

// 2017-06-05 this didn't fix the problem with absolute path
// need to get the root otherwise all the resolve are wrong here
// const root = path.resolve( join('..' , process.cwd()) );
const root = '';

/**
 * This is a share configure file between gulp and plop
 */

const devPath = join(root , '.dev');

const destPath = join(root , '<%= destPath %>');
const appPath = join(root , '<%= appPath %>');
const srcPath = join(root , '<%= srcPath %>');

let yeoman = {
    app: appPath,
    dest: destPath,
    dev: devPath,
    script: join(appPath , 'scripts'),
    test: join(root , '__tests__'),
    node: join(root , 'node_modules'),
    bower: join(root , 'bower_components'),

    scriptDev: join(devPath , 'scripts'),
    styleDev: join(devPath , 'styles'),
    assetDev: join(devPath , 'assets'),

    scriptDest: join(destPath , 'scripts'),
    styleDest: join(destPath , 'styles'),
    assetsDest: join(destPath , 'assets')
};

const includePaths = [
    join(yeoman.script , 'components'),
    join(yeoman.script , 'mixins'),
    join(yeoman.script , 'services'),
    join(yeoman.script , 'models')
];

 // adding the global package here so we could re-use them
 // and auto generate the external array
 let globalLibs = {
     riot: 'riot',
'riot-route': 'route',
   jquery: '$',
  baconjs: 'Bacon',
 immutable: 'Immutable',
   lodash: '_',
   moment: 'moment',
'promise-polyfill': 'Promise',
    fetch: 'fetch'
};

let externalLibs = [] ,
    esLintGlobals = [];

for (let name in globalLibs) {
    externalLibs.push(name);
    esLintGlobals.push(globalLibs[name]);
}
esLintGlobals.push('Blob');
esLintGlobals.push('BlobBuilder');
// DIY
const fontPaths = [];

// export
module.exports = {
    esLintGlobals,

    yeoman: yeoman,
    globalLibs: globalLibs,
    externalLibs: externalLibs,
    extensions: extensions,
    includePaths: includePaths,
    fontPaths: fontPaths
};
