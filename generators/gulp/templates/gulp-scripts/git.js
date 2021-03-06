'use strict';
/**
 * porting back from the main Hermes - to enable the zip commit checkout etc
 */
const { gulp } = require('gulp-server-io/gulp');
const { chalk } = require('gulp-server-nodex');
const git = require('gulp-git');
const bump = require('gulp-bump');
const path = require('path');
const semver = require('semver');
const fs = require('fs');
const argv = require('yargs').option('type', {
    alias: 'rt', // <-- release type
    choices: ['patch', 'minor', 'major']
  }).argv;

const join = path.join;
const config = require('./config');
const root = process.cwd();
const cb = (done) => {
  return (err) => {
    done();
    if (err) {
      throw err;
    }
  };
};
/**
 * init the git
 * @param {function} done
 */
exports.init = (done) =>
{
  git.init( (err) =>
  {
    done();
    if (err) {
      throw err;
    }
    console.log(
      chalk.yellow('Git init done! Don\'t forget to run `git remote add origin URL_TO_GIT`')
    );
  });
};

/**
 * this will return the method to use in the pipe
 * see the example here https://www.npmjs.com/package/gulp-git-push
 */
exports.push = (done) =>
{
  const origin = argv.origin || 'origin';
  const branch = argv.branch || 'master';
  return git.push(origin, branch, {args: " --tags"}, cb(done));
};

/**
 * pull
 */
exports.pull = (done) =>
{
  return git.pull('origin', 'master', {args: '--no-edit'}, cb(done));
};
/**
 * simple add any new files to the git
 */
exports.add = () =>
{
  return gulp.src(root)
    .pipe(git.add());
};

/**
 * breaking out for re-use
 */
exports.getCommit = () =>
{
  const type = argv.staging ? 'staging' : 'release';
  const msg = argv.msg || `System build: ${type} committed on ` + (new Date()).toUTCString();
  return git.commit(undefined, {
    args: `-am "${msg}"`,
    disableMessageRequirement: true
  });
};

/**
 * commit with -am and generate the commit message on the fly if there is none
 */
exports.commit = () =>
{
  return gulp.src(root)
    .pipe(git.add())
    .pipe(exports.getCommit());
};

/**
 * helper method to get the verion from the file
 * @param {string} file the full path to the file
 * @param {string} type patch , minor or major default patch
 * @return {string} ver the next version by the type
 */
exports.getVer = (file , type='patch') =>
{
  const pkg = JSON.parse(fs.readFileSync(file , 'utf8'));
  return semver.inc(pkg.version, type);
};

/**
 * get your bump up version 
 */
exports.getVerBump = () =>
{
  // setup the version update
  const type = argv.type || 'patch';
  const ver  = argv.ver;
  const key  = argv.ver ? 'version' : 'type';
  const update = key === 'version' ? {[key]: ver} : {[key]: type};
  return bump(update);
};

/**
 * bump the version
 */
exports.verBump = () =>
{
  return gulp.src(join(root , 'package.json'))
    .pipe(exports.getVerBump())
    .pipe(gulp.dest(root));
};
/**
 * tag your commit
 */
exports.tag = (done) =>
{
  const type = argv.staging ? 'staging' : 'build';
  const version = require( join(root , 'package.json')).version;
  return git.tag(version , `build ${type} tag at ${version}` , cb(done));
};
