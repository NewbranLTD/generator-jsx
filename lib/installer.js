/**
 * the purpose of this class is to allow you
 * to put all your private methods here and
 * make the top level files much cleaner
 * mainly for the app/index.js because that require a lot
 * more methods that the others
 */
const BaseClass = require('./base-class.js');

module.exports = class Installer extends BaseClass {

    /**
     * @param {object} args arguments
     * @param {array} opts options
     */
    constructor(args, opts)
    {
        super(args, opts);

        this.npmList = require(
            this._templatePath('npm-list.json')
        );
    }

    /**
     * getter css frameworks
     *
     */
    get cssFramworks()
    {
        const cssList = this.npmList.css,
        version = 6;
        return cssList.map( item =>
        {
            switch (item.value) {
                case 'materialui':
                case 'bootstrap4':
                    item.name = item.name.replace('$version' , version);
                    item.bower = item.bower.replace('$version' , version);
                    item.npm = item.npm.replace('$version' , version);
                break;
                default:
            }
            return item;
        });
    }

    /**
     * getter css dev style
     */
    get cssDevStyles()
    {
        return this.npmList.cssDevStyles;
    }

    // Yeoman style privates
    __getNpmLibDeps() {
        // @20170901 falling back to use bower, still no good solution at the moment
        return [];
    }
    /**
     * Get the list of bower dependencies
     * @return {array} list
     */
     __getBowerLibDeps() {
        let list = this.npmList.based; // @20170901 riot and riot-route are base deps
        if (this.props.cssFramework === 'none') {
            return list;
        }
        return list.concat(
            this.cssFrameworks.filter(e => {
                return e.value === this.props.cssFramework;
            }).map(e => {
                return e.npm;
            })
        );
    }
    /**
     * Getting the devDepenecies
     * @return {array} list
     */
     __getDevLibDeps() {
        // Append the test required deps here
        let list = this.npmList.dev.concat(this.npmList.jest);
        // Start adding other deps
        if (this.props.useGit) {
            list = list.concat(this.npmList.git);
        }
        if (this.props.cssDevStyle === 'scss') {
            return list.concat(this.npmList.scss);
        }
        return list.concat(this.npmList.postcss);
    }
    /**
     * Display a message during installation
     * @param {array} list
     * @param {string} title
     */
    __installMsg(list, title = 'INSTALLING') {
        this.log(chalk.white('INSTALLING ' + title));
        list.forEach(l => {
            this.log(chalk.white(' -> ' + l));
        });
    }
    /**
     * Core bower dependencies
     * @return {array}
     */
    __jsBowerLibDeps() {
        const list = this.__getBowerLibDeps().concat(
            this.props.optionalDeps
        );
        this.__installMsg(list, 'DEPENDECIES');
        return list;
    }
    /**
     * Dev dependencies
     * @return {array}
     */
    __jsDevLibDeps() {
        const list = this.__getDevLibDeps();
        this.__installMsg(list, 'DEV DEPENDECIES');
        return list;
    }
    /**
     * 2017-06-06 going back to use bower because using npm to manage browser deps is a joke
     * @param {function} callback
     */
    __cb(callback) {
        return (typeof callback === 'function') ? callback : function () {};
    }
    /**
     * this need to be the last call because yarn bug that wipe out the bower folder!
     * @param {function} cb
     */
    __installBowerDeps(cb) {
        // Need to combine the option and do the installation here
        return this.bowerInstall(
            this.__jsBowerLibDeps(),
            {save: true},
            this.__cb(cb)
        );
    }
    /**
     * Install the npm deps
     * @param {function} cb
     */
    __installNpmDeps(cb) {
        const packages = this.__getNpmLibDeps();
        const opt = {save: true};
        if (this.props.installer === 'cnpm') {
            // Const ex = spawn('cnpm' , ['install' , '--save']);
            return this.runInstall('cnpm', packages, opt, this.__cb(cb));
        }
        // Const opt = (this.props.installer === 'yarnInstall') ? {dev: true} : {save: true};
        return this[this.props.installer](
              packages,
              opt,
              this.__cb(cb)
        );
    }

    /**
     * Yarn or npm here (@TODO auto detect what they have got)
     * @param {function} cb
     */
    __installDevDeps(cb) {
        const packages = this.__jsDevLibDeps();
        if (this.props.installer === 'cnpm') {
            // Const ex = spawn('cnpm' , ['install' , '--save']);
            return this.runInstall('cnpm', packages, {saveDev: true}, this.__cb(cb));
        }

        const opt = (this.props.installer === 'yarnInstall') ? {dev: true} : {saveDev: true};
        return this[this.props.installer](
            packages,
            opt,
            this.__cb(cb)
        );
    }

    /**
     * Just copy the assets folder there is nothing but just a README file
     */
    __copyAssets() {
        this._copy(
            join('app', 'assets', 'README.md')
        );
    }
    /**
     * Copy every gulp related stuff here
     */
    __copyGulpFiles() {
        const isCss = this.props.cssDevStyle === 'css';
        const isSass = this.props.cssDevStyle === 'scss';
        this._copyTpl(
            'gulpfile.js',
            null, // 'gulpfile.js',
            {
                css: isCss,
                sass: isSass,
                useGit: this.props.useGit
            }
        );
        const templatePath = join(__dirname, 'templates');
        glob(join(templatePath, 'gulp-scripts', '**', '*.*'), (er, files) => {
            if (er) {
                this.log(chalk.red('globbing gulp files error!'));
                throw er;
            }
            files.forEach(src => {
                // Skip the file based on how they develop their style
                const filename = path.basename(src);
                if (isCss && filename === 'sass.js') {
                    return;
                }
                if (isSass && filename === 'css.js') {
                    return;
                }
                // Not a default template path
                this._copy(
                    src.replace(templatePath, ''),
                    join('gulp-scripts', path.basename(src))
                );
            });
        });
    }
    /**
     * This one needs a lot of calculations ...
     */
    __copyAppFiles() {
        const basePath = join(appPath, 'scripts', 'components');
        const framework = this.props.cssFramework;
        const frameworkBase = join(basePath, framework);
        // Babel profile - should be in the root folder
        // @UPDATE we might need to have separate babel file for test and app code
        this._copy(join(appPath, 'babelrc'), join('.babelrc'));
        // Main.js
        this._copyTpl(
            [appPath, 'scripts', 'main.js'],
            null, // [appPath, 'scripts', 'main.js'],
            {cssFramework: framework}
        );
        // Tag files
        this._copy(
             join(basePath, 'app', 'app.tag')
        );
        this._copy(
             join(frameworkBase, 'home', 'home.tag'),
             join(basePath, 'home', 'home.tag')
        );
        this._copy(
             join(frameworkBase, 'about', 'about.tag'),
             join(basePath, 'about', 'about.tag')
        );
        // The rest of the apps
        this._copy(
             join(frameworkBase, 'app', 'app-route.tag'),
             join(basePath, 'app', 'app-route.tag')
        );
        this._copyTpl(
            [frameworkBase, 'app', 'app-nav.tag'],
            [basePath, 'app', 'app-nav.tag'],
            {appName: this.props.appName}
        );
    }
    /**
     * Copy the test files
     */
    __copyTestFiles() {
        const testPath = config.testPath;
        this._copy(
            join(testPath, 'tags', 'about.test.js')
        );
        this._copy(
            join(testPath, 'tags', 'home.test.js')
        );
    }
    /**
     * Default type to css - @TODO remove this reference we are going back to use bower
     * @param {string} type
     */
    __getCssFilePath(type = 'css') {
        const paths = {
            bootstrap4: {
                css: join('bootstrap', 'dist', 'css', 'bootstrap.css'),
                scss: join('bootstrap', 'scss', 'bootstrap.scss')
            },
            materialui: {
                css: join('daemonite-material', 'css', 'material.css'),
                scss: join('daemonite-material', 'assets', 'sass', 'material.scss')
            },
            foundation6: {
                css: join('foundation-sites', 'dist', 'css', 'foundation.css'),
                scss: join('foundation-sites', 'assets', 'foundation.scss')
            },
            tachyons: {
                css: join('tachyons-css', 'css', 'tachyons.css'),
                scss: join('tachyons-css', 'css', 'tachyons.css')
            },
            bmd4: {
                css: join('bootstrap-material-design', 'scss', '_core.scss'), // fucking annoying
                scss: join('bootstrap-material-design', 'scss', '_core.scss')
            },
            none: {
                css: null,
                scss: null
            }
        };
        return paths[this.props.cssFramework][type];
    }
    /**
     * For the index file
     */
    __copyHtmlFile() {
        let opt = {
            title: this.props.appName,
            lang: this.lang,
            cssFilePath: false,
            cssFramework: this.props.cssFramework
        };
        if (this.props.cssFramework !== 'none' && this.props.cssDevStyle === 'css') {
            opt.cssFilePath = this.__getCssFilePath();
        }
        this._copyTpl(
             [appPath, 'index.html'],
             null, // [appPath, 'index.html'],
             opt
        );
    }
    /**
     * What the name said
     */
    __copyStyleFile() {
        if (this.props.cssDevStyle === 'scss') {
            let basePath = this.__getCssFilePath('scss');
            this._copyTpl(
                 [appPath, 'styles', 'main.scss'],
                 null, // [appPath, 'styles', 'main.scss'],
                 {
                     cssFrameworkFilePath: basePath,
                     appName: this.props.appName
                 }
            );
        } else {
            this._copyTpl(
                [appPath, 'styles', 'main.css'],
                null,
                {appName: this.props.appName}
            );
        }
    }
    /**
     * What the name said
     */
    __copyBaseFiles() {
        this._copy('gitignore', '.gitignore');
        ['eslintrc.js'].forEach(file => {
            this._copy(file);
        });
        // 'nb.config.js'
        this._copyTpl(
            'nb.config.js',
            null,
            config
        );
    }
    /**
     * Run the gulp command at the end
     * @2017-07-09 add the git sub command and switch if useGit
     */
    __gulpDev() {
        const cmd = this.props.useGit ? 'project:init' : 'dev';
        const ls = spawn('gulp', [cmd]);
        this.log(
            chalk.white(
                this.langObj.runningGulpForYou.replace('{{cmd}}', cmd)
            )
        );
        ls.stdout.on('data', data => {
            this.log(`${data}`);
        });
        ls.stderr.on('data', data => {
            this.log(chalk.yellow(`stderr: ${data}`));
        });
        ls.on('close', code => {
            this.log(chalk.red(`child process exited with code ${code}`));
        });
    }




};

// -- EOF --
