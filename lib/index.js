/* es-lint one-var: 0, no-sync: 0, no-confusing-arrow: 0 */
/**
 * This is the new base class which extend from the generator-nodex BaseClass
 */
const path = require('path'),
// childProcess = require('child_process'),
  Generator = require('generator-nodex/lib'),
  {lodash, when, fsExtra} = require('generator-nodex');
  // short hands
const _ = lodash,
  join = path.join,
// exec = childProcess.exec,
// spawn = childProcess.spawn,
  dirname = join(__dirname, '..'),
  {name} = require(join(dirname, 'package.json')),
  zero = 0;
// validator = (value) => value && lodash.isEmpty(value);

// create class
module.exports = class extends Generator {
  /**
   * constructor, we do our overloading here
   * @param {array} args arguments
   * @param {object} opts options
   */
  constructor(args, opts)
  {
    super(args, lodash.extend({}, opts, {
      baseconfig: join(__dirname, 'config.json'),
      langpath: join(__dirname, 'langs')
    }));
    this.baseConfig.pkgName = name;
    this.jsonProps = this.fs.readJSON(join(__dirname, 'css-frameworks.json'));
  }

  /**
   * also when init we query the existing .yo-rc.json
   * if it's newly install then we know there is nothing
   */
  get installedProfile() {
    return _.merge(
      this.config.getAll(),
      fsExtra.readJsonSync(
        this._destinationPath(['lib', '.generator-config.json'])
      )
    );
  }

  /**
   * overload the parent method
   * @param {undefined} nothing nil
   * @return {function} function
   */
  installerAskForModuleName() {
    if (this.props.appType === 'webapp') {
      return super.installerAskForWebAppName();
    }
    return super.installerAskForModuleName();
  }

  /**
   * Ask the user what framework would they like to include
   * @param {undefined} nothing nil
   * @return {object} promise
   */
  installerAskForCssFrameworks() {
    return this.prompt({
      type: 'list',
      name: 'cssFramework',
      message: 'cssFramework',
      choices: this.jsonProps.frameworks
    }).then( answer => {
      // grab the content of the json
      this.props.cssFrameworkProps = this.jsonProps.frameworks.filter( f => f.value === answer.cssFramework)[zero];
      return answer;
    });
  }

  /**
   * ask for how to develop their css
   * @param {undefined} nothing nil
   * @return {object} promise
   */
  installerAskForCssDevStyle() {
    return this.prompt({
      type: 'list',
      name: 'cssDevStyle',
      message: 'cssDevStyle',
      choices: this.jsonProps.devStyle,
      default: () => this.props.cssFrameworkProps
          ? this.props.cssFrameworkProps.dev
          : 'none'
    }).then( answer => {
      this.props.cssDevStyle = answer.cssDevStyle;
    });
  }

  /**
   * Ask if they want to add optional packages
   * @param {undefined} nothing nil
   * @return {object} promise
   */
  installerAskForOptionalPkg() {
    return this.prompt({
      type: 'checkbox',
      name: 'optionalPkg',
      message: 'Would you like to add optional packages',
      choices: this.optionalPackages
    }).then( answer => {
      const result = {};
      this.props.optionalPackages = answer.optionalPkg.length
        ? answer.optionalPkg.map( p => {
          const pkg = this.optionalPackages.filter(op => op.value === p)[zero],
            r = {};
          r[pkg.value] = pkg.version;
          return r;
        }).reduce((a, b) => _.merge(a, b), result)
        : result;
    });
  }

  /**
   * return the dependencies based on the css framework the user picked
   * @param {object} frameworks what frameworks
   * @return {object} dependencies
   */
  _getCssFrameworkDeps(frameworks) {
    const pkg = {};
    if (this.props.cssFrameworkProps.value !== 'none') {
      pkg[this.props.cssFrameworkProps.value] = frameworks[this.props.cssFrameworkProps.value].version;
      return _.extend(
        pkg,
        frameworks[this.props.cssFrameworkProps.value].dependencies
      );
    }
    return pkg;
  }

  /**
   * get the dev dependecies for css dev
   * @param {object} devDependencies what devDependencies
   * @return {object} devDependencies
   */
  _getCssDevDeps(devDependencies) {
    const pkg = {};
    if (this.props.cssFrameworkProps.value !== 'none') {
      return _.extend(
        devDependencies.all,
        devDependencies[this.props.cssDevStyle]
      );
    }
    return pkg;
  }

  /**
   * optional package dependencies
   * @param {object} frameworks what frameworks
   * @return {object} dependencies
   */
  _getOptionalPackagesDeps(frameworks) {
    const pkg = {},
      opts = [];
    _.forEach(this.props.optionalPackages, (v, k) => {
      opts.push(k);
    });
    if (opts.length) {
      return opts.map( k => frameworks[k] ? frameworks[k].dependencies : {}).reduce((a, b) => _.merge(a, b), pkg);
    }
    return pkg;
  }

  /**
   * generate a map for the vendor.js file
   * @param {object} deps what deps
   * @param {object} globals pre-defined map
   * @return {object} imports for vendor
   */
  _getDepsForVendor(deps, globals) {
    const keys = Object.keys(deps);
    return _.uniq(keys).map( key => {
      const v = globals[key],
        obj = {value: key};
      if (v) {
        obj.name = v;
      }
      return obj;
    });
  }

  /**
   * process the config file
   * @return {object} promise
   */
  _extractBaseConfig() {
    const minus = -1;
    return when.promise( resolver => {
      const dontwant = ['lang','langPath','pkgName','developerName'],
        properties = {};
      _.forEach(this.baseConfig, (v, k) => {
        if (dontwant.indexOf(k) > minus) {
          return;
        }
        properties[k] = k==='moduleDir' && this.props.appType === 'module' ? 'modules' : v;
      });
      resolver(properties);
    });
  }

  /**
   * generate a config file based on the type the user select
   * @param {object} propsPkg the app/templates/package.json we want the globals
   * @return {undefined} nothing to return
   */
  _generateConfigFileForProject(propsPkg) {
    this._extractBaseConfig().then( props => {
      this.fs.writeJSON(
        this._destinationPath(join('lib' , '.generator-config.json')),
        _.merge(props, {globals: propsPkg.globals})
      );
    });
  }
};
