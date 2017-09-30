
const chalk = require('chalk'),
    yosay = require('yosay'),
    path = require('path'),

/**
 * this is the top level app/index.js
 */
// include our BaseClass extends from Generator
version = require('../../package.json').version,
Installer = require('../../lib/installer.js');

module.exports = class extends Installer {

    /**
     * class constructor
     * @param {object} args arguments
     * @param {array} opts options
     */
    constructor(args , opts)
    {
        const baseIndex = 0;
        // init parent
        super(args , opts);
        this.suggestAppName = args.length ? args[baseIndex] : path.basename(this.contextRoot);
         // Skip installation
        this.skipInstallation = opts['skip-installation-for-test-purpose-only'];
        this.config.set({
            appName: this.appName,
            lang: this.lang
        });
        // @TODO this will change to npm instead
        this.optionals = this.npmList.bower.map(optional => {
            optional.checked = true;
            return optional;
        });
    }

    ///////////////////////////////////////
    //     INTERNAL YEOMAN HOOKS         //
    //  They will run one after another  //
    //  In a sync manner                 //
    ///////////////////////////////////////

    /**
     * where you put your init methods
     * start by sorting out the name of the project
     * and greeting of course
     * @returns {null} nothing
     */
    initializing()
    {
        this.log(
            yosay(
                this.langObj.greeting.replace(
                    '{{generatorName}}',
                    chalk.red('generator-rtjs')
                ).replace(
                    '{{version}}',
                    version
                )
            )
        );
    }

    /**
     * configuration task if any
     * @return {null} nothing
     */
    configuring()
    {
        const cn = this.lang === 'cn',
        installChoices = [
            {
                name: 'npm',
                value: 'npmInstall'
            },
            {
                name: 'yarn',
                value: 'yarnInstall'
            }
        ];
        if (cn) {
            installChoices.push({
                name: 'cnpm',
                value: 'cnpm'
            });
        }
        // need to figure out the app name here
    }

    /**
     * the default task - but not recommend to use this see next
     * @return {null} nothing
     */
    default()
    {
        // I don't find this default any useful and rather confusing
    }

    /**
     * where you ask questions and collect answers in the this.props
     * @return {null} nothing
     */
    prompting()
    {
        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the luminous ' + chalk.red('generator-preact') + ' generator!'
        ));

        const prompts = [{
            type: 'confirm',
            name: 'someAnswer',
            message: 'Would you like to enable this option?',
            default: true
        }];
        return this.prompt(prompts).then(props => {
            // To access props later use this.props.someAnswer;
            this.props = props;
        });
    }
    /**
     *
     * @return {null} nothing
     */
    writing()
    {
        this.fs.copy(
            this.templatePath('dummyfile.txt'),
            this.destinationPath('dummyfile.txt')
        );
    }
    /**
     * conflicts handler during the write
     * @return {null} nothing
     */
    conflicts()
    {
        // resolve any conflicts you may have during installation
    }
    /**
     * run the installer
     * @return {null} nothing
     */
    install()
    {
        this.installDependencies();
    }
    /**
     * end and run the clean up etc
     * @return {null} nothing
     */
    end()
    {
        // any clean up or say goodbye etc here
    }

};
