
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
        // need to figure out the app name here
        this.suggestAppName = args.length ? args[baseIndex] : path.basename(this.contextRoot);
         // Skip installation
        this.skipInstallation = opts['skip-installation-for-test-purpose-only'];

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
                    chalk.red('generator-jsx')
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
        const installers = this._getInstallerChoices();
        // do the first prompt here to ask for the name
        // then we could do a config?

    }

    /**
     * the default task - but not recommend to use this see next
     * @return {null} nothing
     */
    /*
    default()
    {
        // I don't find this default any useful and rather confusing
    }
    */
    /**
     * where you ask questions and collect answers in the this.props
     * @return {null} nothing
     */
    prompting()
    {
        const prompts = [{
            type: 'input',
            name: 'appName',
            message: 'Would you like to enable this option?',
            default: this.suggestAppName
        }];

        return this.prompt(prompts).then(props => {
            // To access props later use this.props.someAnswer;
            this.props = props;
            // need to move this further down
            this.config.set({
                appName: this.props.appName,
                lang: this.lang
            });
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
