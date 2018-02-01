/**
 * just return the method to grab the config file here
 */
const { fsExtra } = require('generator-nodex');
const path = require('path');
// just return as an object
// if you want to change the parameters then I recommend you do not change it directly
// on file, instead
// const { lodash } = require('generator-nodex');
// = _.merge(generator-config.json { this is your overwrite })
module.exports = fsExtra.readJsonSync( path.join( __dirname, '..', '.generator-config.json'));
