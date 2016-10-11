'use strict';

const path = require('path');

module.exports = {
  process(dir, dirBase) {
    dir = dir.replace('.git', '');
    process.chdir(path.join(dirBase, dir));
    if (this.fsExists('.git')) {
      this.params.dependencyFiles.forEach((file) => {
        if (this.fsExists(file)) {
          this.logger.info('Changing dependencies of', '#magenta', dir, '-', file);
          this.d2r(file);
        }
      });
    }
  },
  run: function() {
    this.gitAllRepos(this.process);
  },

  emit() {
    return {
      repos: this.params.repos
    };
  }

};