'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

module.exports = {

  addons: {
    gitChangeOrigin(content) {
      if (content.indexOf(this.params.fromRepo) >= 0) {
        content = content.replace(this.params.fromRepo, this.params.toRepo);
        content = content.replace(/https:.*@/, this.params.sshInit);
        content = content.replace(/https:\/\//, this.params.sshInit);
        if (this.params.matches) {
          Object.getOwnPropertyNames(this.params.matches).forEach((key) => {
            content = content.replace(`\/${key}\/`, `/${this.params.matches[key]}/`);
          });
        }
        return content;
      } else if (content.indexOf(this.params.toRepo) >= 0) {
        return '';
      } else {
        return;
      }
    },
    gitRepoStatus(repoName) {

      const notMigrated = (_repoName, _pull) => {
        this.logger.info(_repoName, '#magenta', 'not migrated!');
        this.logger.trace(_pull.stdout.toString(), _pull.stderr.toString());
        return Promise.resolve({rollback: true});
      };

      this.logger.trace('Processing:', repoName);
      const pull = this.sh('git pull');
      if (pull.status === 0) {
        this.logger.info(repoName, '#green', 'migrated OK!');
        return Promise.resolve();
      } else {
        const output = `${pull.stdout.toString()} ${pull.stderr.toString()}`;
        if (output.indexOf('Repository not found') >= 0) {
          return this._gitAskUser(`Manually create repository ${repoName},\n (Y) Assume that creation was done (n) Do not migrate this repository`)
            .then((goOn) => {
              if (goOn) {
                return this.gitRepoStatus(repoName);
              } else {
                return notMigrated(repoName, pull);
              }
            });
        } else {
          return this._gitAskUser(`${repoName} is going to be replaced by changes in local\n Do you want to replace remote with local?`)
            .then((goOn) => {
              if (goOn) {
                return this.execute('git', ['push', '--all', '-f'])
                  .then(() => this.execute('git', ['push', '--tags']))
                  .then(() => this.logger.info(repoName, '#green', 'migrated OK!'));
              } else {
                return notMigrated(repoName, pull);
              }
            });
        }
      }
    },
    gitAllRepos(closure) {
      if (!this.params.repos) {
        const res = this.sh('find . -name .git');
        this.params.repos = res.stdout.toString().split('\n');
      }
      const dirBase = process.cwd();
      const promises = [];
      this.params.repos.forEach((dir) => promises.push({
        fn: closure,
        args: [dir, dirBase],
        obj: this
      }));
      const waterfall = new this.Waterfall({
        promises: promises,
        logger: this.logger
      });
      return waterfall.start();
    },
    _gitPromptRepo(message) {
      this.params.promptRepo = [ {
        type: 'confirm',
        name: 'proceedAsked',
        required: true,
        message: message
      } ];
    },
    _gitAskUser(message) {
      this._gitPromptRepo(message);
      this.params.proceedAsked = undefined;
      return this.params.neverAskMove ? Promise.resolve(false) :
        this.inquire('promptRepo').then(() => Promise.resolve(this.params.proceedAsked));
    }
  }
};
