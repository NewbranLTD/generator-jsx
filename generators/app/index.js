/**
 * Rtjs:app
 * Riot.js 3 generator
          \
         /  `.-~~--..--~~~-.
        <__                 `.
     ~~~~~~~~~~~~~~~~.~~~~,','
        TOMATO        .~~_,'
*/
const path = require('path');
const {chalk, lodash, fsExtra} = require('generator-nodex');
const Generator = require('../../lib');
// properties
const _ = lodash;
const extend = _.merge;
const join = path.join;
const dirname = join(__dirname, '..', '..');
const {version, name} = require(join(dirname, 'package.json'));
const privateProps = new WeakMap();
let __propsPkg__;
let __basePkg__;
// Class
module.exports = class extends Generator {
  /**
   * class constructor
   * @param {array} args
   * @param {object} opts
   */
  constructor(args, opts) {
    super(args, opts);
    // Skip installation
    //this.skipInstallation = opts['skip-installation-for-test-purpose-only']; // Should never use this!
    this.option('skip-installation-for-test-purpose-only',{
      type: Boolean,
      default: false,
      required: false,
      desc: 'This should only use in development'
    });
    this.option('debug', {
      type: Boolean,
      default: false,
      required: false
    });
  }

  /**
   * it was a `get` before but keep throwing this.fs is undefined
   * return the json with our dependencies configuration
   */
  propsPkg() {
    // caching with private
    if (!__propsPkg__) {
      __propsPkg__ = this.fs.readJSON(this._templatePath('package.json'), {});
    }
    return __propsPkg__;
  }

  /**
   * it was a `get` before but keep throwing this.fs is undefined
   * return the package.json generate on the app root
   */
  basePkg() {
    if (!__basePkg__) {
      __basePkg__ = this.fs.readJSON(this._destinationPath('package.json'), {});
    }
    return __basePkg__;
  }

  /**
   * init
   */
  initializing() {
    this.optionalPackages = this.propsPkg().optionals;
    // say hi
    this.yosay(
      'greeting', {
        generatorName: name,
        version: version
      }
    );
  }

  /**
   * the actual q & a
   */
  prompting() {
    // then we do our prompts ... backward
    return this.installerAskForAppType().
      then(this.installerAskForModuleName.bind(this)).
      then(this.installerAskForCssFrameworks.bind(this)).
      then(this.installerAskForCssDevStyle.bind(this)).
      then(this.installerAskForOptionalPkg.bind(this)).
      then(this.installerAskIfTheyWantPage.bind(this)).
      then(this.installerAskForInstaller.bind(this)). // move the ask for installer back here
      then(answers => this.composeWith(require.resolve('generator-nodex/generators/app'), {
          debug: this.options.debug,
          name: this.props.name,
          lang: this.lang,
          langpath: this.baseConfig.langPath,
          skipInstall: true,
          testEnvironment: 'jsdom',
          poweredBy: 'generator-rtjs',
          'skip-nodex-install': true,
          'skip-package-name-message': true
        }));
  }

  /**
   * Creating files
   */
  writing() {
    // prepare properties to merge into package.json
    const propsPkg = this.propsPkg();
    const pkg = this.basePkg();
    const modulePkg = {};
    // fixing some issue within the package.json during setup
    // pkg.repository = ['git@github.com:', pkg.repository, '.git'].join('');
    if (this.props.appType === 'module') {
      pkg.module = "modules/index.js";
      pkg.main = pkg.module;
      pkg.files = ['modules'];
    }
    const cssFrameworkDeps = this._getCssFrameworkDeps(propsPkg.frameworks);
    const dependencies = extend(
      {},
      propsPkg.dependencies,
      this.props.optionalPackages,
      cssFrameworkDeps,
      this._getOptionalPackagesDeps(propsPkg.frameworks)
    );
    const temp = extend({}, dependencies, cssFrameworkDeps);
    // @20171125 when they are developing module we should move dependencies to devDependencies
    // this is due to the fact npm is NOT FOR BROWER dependencies management!
    let pkgToWrite = {jest: {testEnvironment: 'jsdom'}};
    const devDependencies = this._getCssDevDeps(propsPkg.devDependencies);
    if (this.props.appType === 'module') {
      pkgToWrite = extend(pkgToWrite, {devDependencies: extend({}, dependencies, devDependencies)});
    }
    else {
      pkgToWrite = extend(pkgToWrite, {
        dependencies,
        devDependencies: devDependencies
      });
    }
    this.fs.writeJSON(
      this._destinationPath('package.json'),
      extend(pkg, pkgToWrite)
    );
    // need to generete a config.json file into the /lib folder
    this._generateConfigFileForProject(propsPkg);
    // for some reason the variable pass to the default() are all undefined
    // so we have to do this one here
    this._copyTpl(['app','scripts','vendor.js'], {optionals: this._getDepsForVendor(temp, propsPkg.globals)}
    );
  }

  default() {
    this.composeWith(require.resolve('../gulp') , {
      cssDevStyle: this.props.cssDevStyle,
      name: this.props.name
    });
    const params = {lang: this.lang};
    // setup the minimum app folder
    this._copyTpl(
      ['app','index.html'],
      _.extend(params, {title: [this.props.name, this.props.appType].join(' ')})
    );
    this._copyTpl(
      ['app', '404.html'],
      _.extend(params, {title: this.t('Ooops 404 NOT FOUND')})
    );
    this._copyDir(['app', 'assets']);
    // next generate the vendor.js file

    // create the docs folder
    if (this.props.githubPage) {
      this._copyTpl(
        ['docs','index.html'],
        _.extend(params, {title: this.props.name + ' github page'})
      );
    }
    const base = {appName: this.props.name};
    // next copy over the style file
    switch (this.props.cssDevStyle) {
      case 'sass':
        this._copyTpl(
          ['app', 'styles', 'main.scss'],
          extend(base, {cssFrameworkFilePath: this.props.cssFrameworkProps.files.sass})
        );
      break;
      case 'less':
        this._copyTpl(
          ['app', 'styles', 'main.less'],
          extend(base, {cssFrameworkFilePath: this.props.cssFrameworkProps.files.less})
        );
      break;
      default:
        this._copyTpl(['app', 'styles', 'main.css'], base);
    }
  }

  /**
   * Running the dependencies installation
   */
  install() {
    if (!this.options['skip-installation-for-test-purpose-only']) {
      // run installer
      this.installerInstallDependencies();
    }
    // and move the /lib/index.js to the different location
    const target = this._destinationPath(join('lib','index.js'));
    // remove the lib/js file
    if (this.props.appType === 'webapp') {
      fsExtra.remove(target).
        catch( err => {
          this.log(chalk.red('fail to remove lib/index.js'));
        });
    }
    else if (this.props.appType === 'module') {
      fsExtra.move(target, this._destinationPath(join('modules', 'index.js'))).
        catch( err => {
          this.log(chalk.red('fail to move to modules'));
        });
    }
  }

  /**
   * end message
   */
  end() {
    this.log(
      chalk.yellow('BYE!')
    );
    // @TODO ask them if they want to perform a update on their packages

    // if they have select githubPage then remind them to setup their page on github as well

    // now run the gulp:init
    if (!this.options['skip-installation-for-test-purpose-only'] && process.env.NODE_ENV !== 'test') {

    }
  }
};
