# generator-jsx [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Yeoman generator for preact.js (not react!!!) / mithril.js using mainly JSX with gulp , rollup and other goodies

# FCUK GIHUB, WE HAVE MOVED TO GITLAB

NEW URL [generator-jsx @ gitlab](https://gitlab.com/newbranltd/generator-jsx)

Yes, fuck you github!

```
....................../´¯/)
....................,/¯../
.................../..../
............./´¯/'...'/´¯¯`·¸
........../'/.../..../......./¨¯\
........('(...´...´.... ¯~/'...')
.........\.................'...../
..........''...\.......... _.·´
............\..............(
..............\.............\...

```


## Installation

```sh
$ npm install --save generator-jsx
```

## Usage

```sh
$ yo jsx
```

## It's harder then expected

It has been taken me longer than expect to research on the `rollup` (I just don't like webpack black box style operation from various build tools!)

Finally got it, first search the core functionality here, then I will fix up the generator for use.

### Part 1 building your App with Preact.js

To start, when I coding this generator, I am working against a skeleton built by the [preact cli](https://github.com/developit/preact-cli).
And got trip over by the way they handle CSS, I really hate the idea to `import` css into your js code, well I guess the whole point of using
JSX is to have all this thing together under one root ...

The following is a complete, and working code for rollup to bundle your app code (with CSS import using `postcss`):

```js
async function rollupApp() {
  const bundle = await rollup.rollup({
    input: 'src/index.js',
    watch: {
      include: 'src/**'
    },
    // moduleName: pkg.amdName,
    external,
    plugins: [
      postcss({
        extract: true,
        sourceMap: true,
        minimize: true,
        plugins: [
          atImport()
        ]
      }),
      json(),
      babel({
        babelrc: false,
        comments: false,
        exclude: 'node_modules/**',
        presets: [
          ['env', {
            "modules": false,
            "targets": {
              "browsers": ["last 2 versions", "safari >= 7"]
            }
          }],
          'stage-0',
          'preact'
        ],
        plugins: [
          'external-helpers'
        ]
      }),
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
        external
      }),
      commonjs({
        include: 'node_modules/**',
        exclude: '**/*.css'
      }),
      uglify()
    ]
  });
  await bundle.write({
    banner: '/* The Shoot App version ' + pkg.version + ' */',
    sourcemap: true,
    format: 'umd',
    file: join(paths.dest, 'app.min.js'),
    name: pkg.amdName,
    globals
  });
}
```

The `postcss` plugin will grab all your css files. In my case, I only keep one top level `./styles/index.css` (many `@import` inside).
**A discovery was made during setting this up**, according to the [postcss-import](https://github.com/postcss/postcss-import) documentation.
You should able to import a npm module by it's name. But it didn't work. I was using [bulma](https://bulma.io/).

```css  
  /* this won't work */
  @import "bulma";
  /* instead point to the location within the node_modules directory */
  @import "bulma/css/bulma.css";

```

Then it works correctly, hope this help someone else out there.

**UPDATE** to make the two compatible (preact-cli and rollup, because I am using both on different things). I change the file and rollup config as follow

In your CSS:

```css
  @import "https://cdnjs.cloudflare.com/ajax/libs/bulma/0.6.2/css/bulma.min.css";
```

Then in your rollup config, add new [rollup-plugin-replace](https://github.com/rollup/rollup-plugin-replace) plugin. And add it before your `postcss` plugin:

```js
  plugins: [
    replace({
      exclude: '**/*.js', // don't want any js files
      'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.6.2/css/bulma.min.css': 'bulma/css/bulma.css'
    }),
    postcss({
      extract: true,
      sourceMap: true,
      minimize: true,
      plugins: [
        atImport()
      ]
    }),
    ...
  ]
```

Now your `bulma.css` file will get bundle into your build css file.

### Part 2, bundle your vendor files (without babel)

Next, another rollup call to bundle your vendor files. First you need to setup a separate `vendor.js` to import modules:

```js
// vendor.js
import { h, Component } from 'preact';
import { Router, route } from 'preact-router';
import { createHashHistory } from 'history';
import store from 'store';
import _ from 'lodash';
import classNames from 'classnames';
// https://github.com/axios/axios/issues/464
// import axios from 'axios/dist/axios',
import superagent from 'superagent';
import noUiSlider from 'nouislider';
import linkState from 'linkstate';
import authentication from '@feathersjs/authentication';
import authenticationClient from '@feathersjs/authentication-client';
import jwt from '@feathersjs/authentication-jwt';
import feathers from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';

```

There was one problem I couldn't fix. It was the [axios](https://www.npmjs.com/package/axios) ajax library. Rollup just keep throwing
`Error: Unexpected token`. So I change it to [superagent](https://www.npmjs.com/package/superagent) instead.

But even `superagent` is not straight forward, the problem is they didn't include a proper `browser` field in their package.json (seriously?!!!)
And they ship with one version for node.js another one is for the browser.

If you just use the node.js and try to bundle it. Rollup will throw a ```sh Error: Illegal reassignment to import 'commonjsHelpers' ``` error.

To fix this, you need to tell `rollup-plugin-node-resolve` which file to use. See the `customResolveOptions` option.

Then your vendor rollup:

```js
async function rollupVendor() {
  const bundle = await rollup.rollup({
    input: 'src/vendor.js',
    plugins: [
      json(),
      commonjs({
        include: [
          join('srv','vendor.js'),
          join('node_modules', '**')
        ],
        ignoreGlobal: false,
        sourceMap: false
      }),
      nodeResolve({
        jsnext: true,
        main: false,
        browser: true,
        customResolveOptions: {
          'node_modules/superagent/superagent.js': 'superagent'
        }
      })
    ]
  });

  await bundle.write({
    sourcemap: false,
    format: 'umd',
    name: 'theShootAppDeps',
    file: join(paths.dest, 'vendor.min.js')
  });
}
```

To use them, just setup them up in your `gulpfile.js`

```js
const { rollupApp, rollupVendor } = require('./gulp-scripts/rollup');

gulp.task('script:app', rollupApp);
gulp.task('script:vendor', rollupVendor);

gulp.task('main', gulp.series('script:vendor', 'script:app'));

```

More coming soon ...


## License

MIT © [Joel Chu](https://newbran.ch)

[npm-image]: https://badge.fury.io/js/generator-jsx.svg
[npm-url]: https://npmjs.org/package/generator-jsx
[travis-image]: https://travis-ci.org/NewbranLTD/generator-jsx.svg?branch=master
[travis-url]: https://travis-ci.org/NewbranLTD/generator-jsx
[daviddm-image]: https://david-dm.org/NewbranLTD/generator-jsx.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/NewbranLTD/generator-jsx
[coveralls-image]: https://coveralls.io/repos/NewbranLTD/generator-jsx/badge.svg
[coveralls-url]: https://coveralls.io/r/NewbranLTD/generator-jsx
