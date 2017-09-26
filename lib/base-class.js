'use strict';
/**
 * reusable class based on yeoman-generator
 *
 */
const Generator = require('yeoman-generator');
const fs = require('fs');
const path = require('path');
const join = path.join;
const chalk = require('chalk');
const exec = require('child_process').exec;
const when = require('when');
// const _ = require('lodash');
 /**
  * Put the repeatly use method in this class and let the other extends from this one
  */

 const config = require(
     join(__dirname, 'config.json')
 );

 // Class defintion
 module.exports = class extends Generator {
     /**
      * Class constructor
      * @param {array} args
      * @param {object} opts
      */
    constructor(args, opts) {
        super(args, opts);

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
     * @param {string} name create a compatible generator name
     */
    /*
   _makeGeneratorName(name) {
       name = _.kebabCase(name);
       return name.indexOf('generator-') === 0 ? name : 'generator-' + name;
   }
   */
      /**
       * Manually create the template path
       * @param {string} src
       */
    _templatePath(src) {
        return join(this.sourceRoot(), src);
    }
      /**
       * Manually create the dest path
       * @param {string} dest
       */
    _destinationPath(dest) {
        return join(this.destinationRoot(), dest);
    }

    /**
     * Copy from src to dest
     * @param {string} src
     * @param {string} dest (optional)
     * @return undefined
     */
    _copy(src, dest = null) {
        dest = (dest === null) ? src : dest;
        return this.fs.copy(
            this._templatePath(src),
            this._destinationPath(dest)
        );
    }
    /**
     * @param {mixed} src
     * @param {mixed} dest
     * @param {object} params (optional)
     * @TODO _copyTpl(...args) {}
     */
    _copyTpl(src, dest, params = {}) {
        // Save some typing
        dest = (dest === null) ? src : dest;
        return this.fs.copyTpl(
            this._templatePath(
                Array.isArray(src) ? join.apply(null, src) : src
            ),
            this._destinationPath(
                Array.isArray(dest) ? join.apply(null, dest) : dest
            ),
            params
        );
    }
    /**
     * CamelCase to camel-case
     * @param {string} s
     */
    _camelToDash(s) {
        return s.replace(/([A-Z])/g, function ($1, p1, pos) {
            return (pos > 0 ? '-' : '') + $1.toLowerCase();
        });
    }
    /**
     * "some thing like this" to someThingLikeThis
     * @param {string} s
     */
    _toCamel(s) {
        return s.replace(/([-_][a-z])/g, function ($1) {
            return $1.toUpperCase().replace(/[-_]/, '');
        });
    }
    /**
     * String input to ClassName
     * @param {string} s
     */
    _toClassName(s) {
        const cc = this._toCamel(s);
        return cc.substr(0, 1).toUpperCase() + cc.substr(1, cc.length - 1);
    }
    /**
     * Load default lang if none
     * @param {string} lang
     */
    _loadLangFile(lang) {
        if (!this._loadLangFileAction(lang)) {
            this._loadLangFileAction(this.defaultLang);
        }
    }
    /**
     * Loading the language file
     * @param {string} lang
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
     * @param {object} opts
     */
    _checkComponent(opts) {
        this.componentDir = false;
        const component = (opts.c || opts.component);
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
     * @param {string} cmd
     */
    _runCommand(cmd) {
        return when.promise((resolver, rejecter) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    return rejecter(`${error}`);
                }
                resolver({
                    stdout: `${stdout}`,
                    stderr: `${stderr}`
                });
            });
        });
    }
    /**
     * Check if yarn installed or not
     * but don't do this when it's in a test environment
     */
    _checkIfYarnInstalled() {
        return when.promise(resolver => {
            if (process.env.NODE_ENV === 'test') {
                return resolver(false);
            }
            this._runCommand('yarn versions').then(() => {
                // / console.log(result); // Need to check the results here
                // The same bug surface the property set earlier
                // disappear the prompt so setting this.props.installer is useless
                resolver(true);
            }).catch(() => {
                resolver(false);
            });
        });
    }
};

// -- EOF --
