'use strict';

const fs = require('fs');
const path = require('path');

const rimraf = require('rimraf');

module.exports = {
  check: function(ok, ko) {
    const pattern = new RegExp(/.*.pub/);
    const sshDir = path.join(process.env.HOME, '.ssh');
    let found = false;

    if (this.fsExists(sshDir)) {
      const files = fs.readdirSync(sshDir);
      found = (files.length > 0) && files.map((file) => pattern.test(file)).reduce((a, b) => a || b);
    }

    if (found) {
      this.logger.info('It looks like you have a rsa id', '#green', 'installed!');
    } else {
      this.logger.framed('\n\nYou need a rsa id in order to connect to git via ssh.\nPlease follow the instructions in', '#yellow', `${this.params.generateSSHdocUrl}\n\n`);
      return ko('check log to fix problems');
    }

    this.cleanTest();
    const result = this.sh(`git clone ${this.params.testRepo}`, ko);
    this.logger.trace(result.stdout.toString(), result.stderr.toString());
    this.cleanTest();

    if (result.status !== 0) {
      this.logger.info('#red', 'ssh is not configured correctly', `you has an error trying to clone ${this.params.testRepo}`, '\n', result.stderr.toString(), '\n\n');
      this.logger.framed('\n\nGo to ', '#yellow', this.params.bitBucketUrl, '#cyan', 'click on "view profile" (top right) >> "Manage account" (Button) >> SSH Keys (Left Menu) >> Add Key (Button) and copy/paste the content of $HOME/.ssh/id_rsa.pub file inside textarea\n\n');
    } else {
      this.logger.info('#green', 'Everything looks to be ok!');
    }
    ok();
  },

  cleanTest() {
    const repoName = this.params.testRepo.match(/\/([^\/]*?)\.git/)[1];
    if (this.fsExists(repoName)) {
      rimraf.sync(repoName);
    }
  }
};

