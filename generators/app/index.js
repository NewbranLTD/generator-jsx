
const chalk = require('chalk'),
    yosay = require('yosay'),
/**
 * this is the top level app/index.js
 */
// include our BaseClass extends from Generator
Installer = require('../../lib/installer.js');

module.exports = class extends Installer {

    /**
     * class constructor
     * @param {object} args arguments
     * @param {array} opts options
     */
    constructor(args , opts)
    {
        // init parent
        super(args , opts);
    }

    ///////////////////////////////////////
    //     INTERNAL YEOMAN HOOKS         //
    //  They will run one after another  //
    //  In a sync manner                 //
    ///////////////////////////////////////

    /**
     * where you put your init methods
     * @returns {null} nothing
     */
    initializing() {
        this.argument('name', {
            type: String,
            required: true,
            description: 'Generator name'
        });
    }

    /**
     * configuration task if any
     * @return {null} nothing
     */
    configuring()
    {
        // configuration option goes here
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
