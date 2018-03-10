/**
 * short hand to call the tag
 */
const BaseClass = require('../../lib');
const join = require('path').join;

module.exports = class extends BaseClass {

  constructor(args, opts) {

    super(args, opts);

    this.argument('componentName', {
      type: String,
      required: true
    });
    // we could call this sub generator to generate our test only
    this.option('testOnly', {
      required: false,
      default: false,
      desc: 'testOnly-component'
    });
  }

  initializing() {

  }


};
