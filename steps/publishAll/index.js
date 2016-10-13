'use strict';

const path = require('path');
const installer = {
  'bower.json': 'bower install',
  'package.json': 'npm install'
};

module.exports = {

  install(cmd) {
    const command = this.sh(cmd);
    this.logger.trace(command.stdout.toString(), command.stderr.toString());
    return command;
  },

  rollback(file) {
    const command = this.sh(`git checkout -- ${file}`, null, true);
    if (command.status === 0) {
      this.logger.info(`Rollback changes in ${file}`, '#green', 'OK');
    } else {
      this.logger.info(`Rollback changes in ${file}`, '#red', 'ERROR');
    }
  },

  checkAll: function(repos) {
    const checkedRepos = [];
    const dirBase = process.cwd();
    repos.forEach((dir) => {
      dir = dir.replace('.git', '');
      process.chdir(path.join(dirBase, dir));
      Object.getOwnPropertyNames(installer).forEach((file) => {
        if (this.fsExists(file)) {
          const command = this.install(installer[file]);
          if (command.status === 0) {
            this.logger.info(dir, '#cyan', installer[file], '#green', 'OK');
            checkedRepos.push(dir);
          } else {
            this.logger.info(dir, '#cyan', installer[file], '#red', 'ERROR:', command.stderr.toString());
            this.rollback(file);
          }
        }
      });
    });
    process.chdir(dirBase);
    return checkedRepos;
  },

  publishAll: function(repos) {
    const files = {
      'bower.json': this.registerBower,
      'package.json': this.publishNpm
    };
    const published = [];
    const dirBase = process.cwd();
    repos.forEach((dir) => {
      dir = dir.replace('.git', '');
      process.chdir(path.join(dirBase, dir));
      Object.getOwnPropertyNames(files).forEach((file) => {
        if (this.fsExists(file)) {
          const status = files[file].apply(this);
          if (status === 0) {
            published.push(dir);
          }
        }
      });
    });
    process.chdir(dirBase);
    return published;
  },

  pushAll: function(repos) {
    const resRepos = [];
    const dirBase = process.cwd();
    repos.forEach((dir) => {
      dir = dir.replace('.git', '');
      process.chdir(path.join(dirBase, dir));
      Object.getOwnPropertyNames(installer).forEach((file) => {
        if (this.fsExists(file)) {
          this.logger.info(dir, 'commit and push changes of', '#cyan', file, '#green', 'OK');
          const commit = this.sh(`git commit ${file} -m "chore(${file}): ${this.params.commitMessage}"`);
          this.logger.trace(commit.stdout.toString(), commit.stderr.toString());
          const push = this.sh('git push');
          this.logger.trace(push.stdout.toString(), push.stderr.toString());
          resRepos.push(dir);
        }
      });
    });
    process.chdir(dirBase);
    return resRepos;
  },

  check: function() {
    if (!this.params.repos) {
      const res = this.sh('find . -name .git');
      this.params.repos = res.stdout.toString().split('\n');
    }
    this.params.prePublishedRepos = this.publishAll(this.params.repos);
    this.params.preCheckedRepos = this.checkAll(this.params.prePublishedRepos);
    this.params.registryDomain = this.params.registryDomainTarget;
    delete this.params.registryCa;
  },

  run: function() {
    this.logger.info('#cyan', this.params.registryDomain, 'checked ->', this.params.preCheckedRepos);
    this.params.publishedRepos = this.publishAll(this.params.preCheckedRepos);
    this.params.checkedRepos = this.checkAll(this.params.preCheckedRepos);
    this.params.pushedRepos = this.pushAll(this.params.checkedRepos);
    this.logger.info('#cyan', this.params.registryDomain, 'pushed ->', this.params.pushedRepos);
  }
};