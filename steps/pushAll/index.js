'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const fse = require('fs-extra');

module.exports = {

  process(dir, dirBase) {
    process.chdir(dirBase);
    const pushFile = path.join(dirBase, this.params.pushFile);
    const file = path.join(dir, 'config');
    if (this.fsExists(pushFile) && this.fsExists(file) && file.indexOf('node_modules') < 0) {
      process.chdir(dir.replace('.git', ''));
      this.logger.info('Distributing', '#cyan', pushFile, 'to', '#green', dir);
      this.params.branches.forEach((branch) => {
        this.sh('git pull ', null, true);
        this.sh(`git checkout ${branch}`, null, true);
        fse.copySync(pushFile, this.params.pushFile);
        this.sh(`git add ${this.params.pushFile}`, null, true);
        this.sh(`git commit ${this.params.pushFile} -m "${this.params.comment}"`, null, true);
        this.sh('git push', null, true);
      });
    }
  },
  run: function(ok, ko) {
    return this.gitAllRepos(this.process).then(ok, ko);
  }

};