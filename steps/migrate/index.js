'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

module.exports = {

  process(dir, dirBase) {
    process.chdir(dirBase);
    const file = path.join(dir, 'config');
    if (this.fsExists(file) && file.indexOf('node_modules') < 0) {
      const content = this.gitChangeOrigin(fs.readFileSync(file).toString());
      if (content && content.length > 0) {
        const tmpFile = `${file}__`;
        fs.renameSync(file, tmpFile);
        fs.writeFileSync(file, content);
        process.chdir(dir.replace('.git', ''));
        return this.gitRepoStatus(content.match(/url = (.*)/)[1])
          .then((status) => {
            if (status && status.rollback) {
              return fs.rename(path.join(dirBase, tmpFile), path.join(dirBase, file));
            }
          });
      } else if (content === '') {
        this.logger.info(dir, '#green', 'has already been migrated!');
        this.params.migratedRepos.push(dir);
      } else {
        this.logger.info(dir, '#yellow', 'is not possible to be migrated');
      }
    }
  },
  run: function(ok, ko) {
    this.params.migratedRepos = [];
    return this.gitAllRepos(this.process).then(ok, ko);
  },

  emit() {
    return {
      repos: this.params.migratedRepos
    };
  }
};