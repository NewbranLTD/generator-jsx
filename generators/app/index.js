'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
/**
 * this is the top level app/index.js 
 */

// include our BaseClass extends from Generator
const BaseClass = require('../../lib/base-class.js');

module.exports = class extends BaseClass {

    /**
     * class constructor
     */
    constructor(args , opts) {
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
     */
    configuring() {

    }

    /**
     * the default task - but not recommend to use this see next
     */
    default() {

    }

    /**
     * where you ask questions and collect answers in the this.props
     */
    prompting() {
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

    writing() {
        this.fs.copy(
            this.templatePath('dummyfile.txt'),
            this.destinationPath('dummyfile.txt')
        );
    }
    /**
     * conflicts handler during the write
     */
    conflicts() {

    }
    /**
     * run the installer
     */
    install() {
        this.installDependencies();
    }
    /**
     * end and run the clean up etc
     */
    end() {

    }

};
