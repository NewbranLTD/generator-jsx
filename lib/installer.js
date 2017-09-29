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





};

// -- EOF --
