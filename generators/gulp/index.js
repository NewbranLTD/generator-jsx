/**
 * implement the gulp set up as a sub generator
 */
const BaseClass = require('../../lib');
const join = require('path').join;
const _ = require('lodash');
const extend = _.merge;

module.exports = class extends BaseClass {
  /*
  constructor(args, opts) {
    super(args, opts);
  }
  */

  initializing() {
    const yoConfig = this.config.getAll();
    // this.log('gulp check yoConfig', yoConfig);
    // check if they have already install
    // then check if they are using what dev option
    // if they want to change it then we could prompt them the question etc
  }

  // add devDependencies
  writing() {
    const pkg = this.fs.readJSON(
      this.destinationPath('package.json'),
      {}
    );
    const devPkg = this.fs.readJSON(
      this._templatePath('package.json'),
      {}
    );
    extend(pkg, {devDependencies: devPkg.devDependencies});
    this.fs.writeJSON(
      this.destinationPath('package.json'),
      pkg
    );
    const ext = '.js';
    const dir = 'gulp-scripts';
    const appName =  this.props.name || this.options.name;
    const devStyle = this.props.cssDevStyle || this.options.cssDevStyle;
    const styleExt = devStyle === 'sass' ? 'scss' : devStyle === 'nextCss' ? 'css' : devStyle;
    // copy templates
    this._copyTpl('gulpfile.tpl', 'gulpfile.js', {
appName,
devStyle
});
    // the watch task based on the css dev style
    this._copyTpl(`${dir}/watch.js.tpl`, `lib/${dir}/watch.js`, {
devStyle,
styleExt
});
    // copy files
    const base = ['git','misc','rollup','server','inject'];
    // @TODO concat the files based on the last questions
    switch (devStyle) {
      case 'nextCss':
        base.push('next-css');
      break;
      default:
        if (devStyle !== 'none') {
          base.push(devStyle);
        }
    }
    base.forEach( f => {
      this._copy( `${dir}/` + f + ext , `lib/${dir}/` + f + ext);
    });
  }
};
