'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

module.exports = {

  addons: {

    _getCacheKeys() {
      if (this.params[this.params.registryDomain]) {
        this.params.email = this.params[this.params.registryDomain].email;
        this.params.apikey = this.params[this.params.registryDomain].apikey;
      } else {
        this.params.email = this.params.apikey = undefined;
        this.logger.framed(`\n\n  Go to https://${this.params.registryDomain}/artifactory/webapp/#/profile to get your API KEY\n\n`);
      }
    },
    _setCacheKeys() {
      const userConfigDir = path.join(process.env.HOME, '.piscosour');
      const userConfigFile = path.join(userConfigDir, 'piscosour.json');
      if (!this.fsExists(userConfigFile)) {
        this.fsCreateDir(userConfigDir);
        fs.writeFileSync(userConfigFile, '{}');
      }
      const userConfig = this.fsReadConfig(userConfigFile);
      if (!userConfig.params) {
        userConfig.params = {};
      }
      if (!userConfig.params[this.params.registryDomain]) {
        userConfig.params[this.params.registryDomain] = {};
      }
      if (!this.params[this.params.registryDomain]) {
        this.params[this.params.registryDomain] = {};
      }
      let hasChange = false;
      if (userConfig.params[this.params.registryDomain].email !== this.params[this.params.registryDomain].email !== this.params.email) {
        hasChange = true;
        userConfig.params[this.params.registryDomain].email = this.params[this.params.registryDomain].email = this.params.email;
      }
      if (userConfig.params[this.params.registryDomain].apikey !== this.params[this.params.registryDomain].apikey !== this.params.apikey) {
        hasChange = true;
        userConfig.params[this.params.registryDomain].apikey = this.params[this.params.registryDomain].apikey = this.params.apikey;
      }
      if (hasChange) {
        this.logger.info('writing user config cache...');
        fs.writeFileSync(userConfigFile, JSON.stringify(userConfig, null, 2));
        spawn(process.execPath, [path.join(this.piscoConfig.getDir('module'), 'bin', 'pisco.js'), '-w'], {stdio: ['ignore', process.stdout, process.stderr]});
      }
    }
  }
};