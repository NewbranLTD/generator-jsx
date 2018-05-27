/**
 * Service mini generator
 */



const BaseClass = require('../../lib');
const join = require('path').join;
const _ = require('lodash');

module.exports = class extends BaseClass {

  constructor(args, opts) {
    super(args, opts);
    this.ext = 'js';
    this._loadLangFile(this.config.get('lang'));

        // Get the tag name
    if (args[0]) {
      const name = args[0];

      this.serviceName = this._toCamel(name);
      this.serviceFileName = this._camelToDash(name);
            // Get if there is a c / component flag
      this._checkComponent(opts);
            // Get extra imports
            // 2017-06-08 the test keep on failing (no idea how to fix the unlinkSync)
            // so add an option here to skip the import lib call
      this.prompts = [];
      if (!opts['skip-import']) {
        this.__getLibImports();
      }
    } else {
      throw this.langObj.ERR_MISSING_MIXIN_NAME;
    }
  }

    /**
     * Read the bower.json an generate the first list
     * @TODO when we restore our own classes need to read from the package.json as well
     */
  __getLibImports() {
    const root = process.cwd();
    // @TODO replace with package.json in the next release
    const dependencies = require(join(root, 'bower.json')).dependencies;
    this.globalLibs = require(join(root, 'nb.config.js')).globalLibs;
        // @TODO read the servies folder and see if they want to extend it
    const packageNames = [];
    _.forEach(this.globalLibs, (value, key) => {
            // Excluding the riot and riot-route there is no point for them in the service
      if (key === 'riot' || key === 'riot-route') {
        return;
      }
      if (_.hasIn(dependencies, key)) {
        packageNames.push({
name: [value, key].join(' -> '),
value: key,
checked: false
});
      }
    });
    if (packageNames.length > 0) {
      this.prompts.push({
        type: 'checkbox',
        name: 'libImports',
        message: this.langObj.IMPORT_EXTRA_LIB,
        choices: packageNames
      });
    }
  }
  /**
   * Return the list of mapped external libraries
   */
  _getExtraImports() {
    if (this.props && this.props.libImports) {
      return this.props.libImports.map(value => ({
          name: this.globalLibs[value],
          id: value
        }));
    }
    return [];
  }
  /**
   * Generate service file based on template
   */
  _writeServiceFile() {
    const fileName = [this.serviceFileName, this.ext].join('.');
    const dest = this.componentDir ? join(this.componentDir, 'services', fileName) : join(this.servicePath, fileName);

    const params = {
      extraImports: this._getExtraImports(),
      parentName: false, // For now
      parentFileName: false,
      serviceName: this.serviceName,
      serviceFileName: dest
    };
          // ExtraImports
    this._copyTpl('service.txt', dest, params);
  }
  /**
   * Generate service test file based on template
   */
  _writeServiceTestFile() {
    const fileName = [this.serviceFileName, 'test', this.ext].join('.');
    const dest = this.componentTestDir ? join(this.componentTestDir, 'services', fileName) : join(this.testPath, 'services', fileName);
    const params = {
      extraImports: this._getExtraImports(),
      parentName: false, // For now
      parentFileName: false,
      serviceName: this.serviceName,
      serviceFileName: dest
    };
    this._copyTpl('service-test.txt', dest, params);
  }
  /**
   * Ask a question
   */
  prompting() {
    if (this.prompts.length > 0) {
      return this.prompt(this.prompts).then(props => {
        this.props = props;
      });
    }
  }
  /**
   * Execute the write
   */
  writing() {
    this._writeServiceFile();
    this._writeServiceTestFile();
  }
};

// -- EOF --
