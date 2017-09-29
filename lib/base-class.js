/**
 * reusable class based on yeoman-generator
 *
 */
const Generator = require('yeoman-generator'),
fs = require('fs'),
path = require('path'),
chalk = require('chalk'),
exec = require('child_process').exec,
when = require('when'),
 /**
  * Put the repeatly use method in this class and let the other extends from this one
  */
join = path.join,
env = process.env,
config = require(join(__dirname, 'config.json'));

// Class defintion
module.exports = class extends Generator {
     /**
      * Class constructor
      * @param {array} args arguments
      * @param {object} opts options
      */
    constructor(args, opts)
    {
        super(args, opts);
        // for later use
        this.configParams = config;
        // Properties
        this.appPath = join(config.appPath, config.scriptPathName);
        // Extended
        this.mixinPath = join(this.appPath, config.mixinPathName);
        this.componentPath = join(this.appPath, config.componentPathName);
        this.servicePath = join(this.appPath, config.servicePathName);
        // module path
        this.modulePath = join(this.appPath , config.modulePathName);
        // Test path with jest
        this.testPath = join(this.destinationRoot(), config.testPath);
        // setup the default lang for use later
        this.defaultLang = config.defaultLang;
        // Init the props for later use
        this.props = {};
        // setting up the lang options
        this.lang = opts.lang ? opts.lang.toLowerCase() : this.defaultLang;
        this._loadLangFile(this.lang);
    }
    /**
     * Manually create the template path
     * @param {string} src source
     * @return {string} path
     */
    _templatePath(src) {
        return join(this.sourceRoot(), src);
    }
    /**
     * Manually create the dest path
     * @param {string} dest destination
     * @return {string} path
     */
    _destinationPath(dest) {
        return join(this.destinationRoot(), dest);
    }
    /**
     * Copy from src to dest
     * @param {string} src source
     * @param {string} dest (optional)
     * @return {undefined} undefined
     */
    _copy(src, dest = null) {
        const _dest = dest || src;
        return this.fs.copy(
            this._templatePath(src),
            this._destinationPath(_dest)
        );
    }
    /**
     * @TODO _copyTpl(...args) {}
     * @param {mixed} src source
     * @param {mixed} dest destination
     * @param {object} params (optional)
     *  @return {undefined} undefined
     */
    _copyTpl(src, dest, params = {}) {
        // Save some typing
        const _dest = dest || src;
        return this.fs.copyTpl(
            this._templatePath(
                Array.isArray(src) ? Reflect.apply(join , null , src) : src
            ),
            this._destinationPath(
                Array.isArray(_dest) ? Reflect.apply(join , null, _dest) : _dest
            ),
            params
        );
    }
    /**
     * CamelCase to camel-case
     * @param {string} s name
     * @return {string} name
     */
    _camelToDash(s) {
        const min = 0;
        return s.replace(/([A-Z])/g, ($1, p1, pos) =>
            (pos > min ? '-' : '') + $1.toLowerCase()
        );
    }
    /**
     * "some thing like this" to someThingLikeThis
     * @param {string} s name
     * @return {string} name
     */
    _toCamel(s) {
        return s.replace(/([-_][a-z])/g, ($1) =>
            $1.toUpperCase().replace(/[-_]/, '')
        );
    }
    /**
     * String input to ClassName
     * @param {string} s name
     * @return {string} name
     */
    _toClassName(s) {
        const start = 0,
            end = 1,
            cc = this._toCamel(s);
        return cc.substr(start, end).toUpperCase() + cc.substr(end, cc.length - end);
    }
    /**
     * Load default lang if none
     * @param {string} lang language
     * @return {undefined}
     */
    _loadLangFile(lang) {
        if (!this._loadLangFileAction(lang)) {
            this._loadLangFileAction(this.defaultLang);
        }
    }
    /**
     * Loading the language file
     * @param {string} lang language
     * @return {undefined}
     */
    _loadLangFileAction(lang) {
        try {
            this.lang = lang;
            const langPath =  join(__dirname , 'lang', lang + '.json');
            this.langObj = require(
                path.resolve(langPath) // Path!!!
            );
            return true; // For get if I don't return true then its undefined same as falsy :p
        } catch (e) {
            this.log(
                chalk.red('Fail to load language json file!')
            );
            return false;
        }
    }
    /**
     * @param {object} opts options
     * @return {undefined} or nothing
     */
    _checkComponent(opts) {
        this.componentDir = false;
        const component = opts.c || opts.component;
        if (component) {
            // const componentDir = join(config.appPath, 'scripts', 'components', component);
            const componentDir = join(this.componentPath , component);
            fs.stat(this._destinationPath(componentDir), (err, stats) => {
                if (err) {
                    this.log(
                        chalk.red(
                            this.langObj.ERR_COMPONENT_NOT_FOUND.replace('{component}', component)
                        )
                    );
                    return;
                }
                if (stats.isDirectory()) {
                    this.componentDir = componentDir;
                    // 30-08-2017 add test directory
                    this.componentTestDir = join(this.testPath, component);
                }
            });
        }
    }
    /**
     * @param {string} cmd command
     * @return {object} promise or resolved
     */
    _runCommand(cmd) {
        return when.promise((resolver, rejecter) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    return rejecter(`${error}`);
                }
                return resolver({
                    stdout: `${stdout}`,
                    stderr: `${stderr}`
                });
            });
        });
    }
    /**
     * Check if yarn installed or not
     * but don't do this when it's in a test environment
     * @return {object} promise
     */
    _checkIfYarnInstalled() {
        return when.promise(resolver => {
            if (env.NODE_ENV === 'test') {
                return resolver(false);
            }
            return this._runCommand('yarn versions').then(() => {
                // / console.log(result); // Need to check the results here
                // The same bug surface the property set earlier
                // disappear the prompt so setting this.props.installer is useless
                resolver(true);
            }).
            catch(() => {
                resolver(false);
            });
        });
    }
};

// -- EOF --
