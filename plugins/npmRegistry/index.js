'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {

  check: function() {
    if (this.params.stages.indexOf('check') >= 0) {
      return this._doCheck();
    }
  },

  run: function() {
    if (this.params.stages.indexOf('run') >= 0) {
      return this._doCheck();
    }
  },
  addons: {

    publishNpm() {
      const npm = this.fsReadConfig('package.json');
      const names = this.checkNames(npm);
      if (names) {
        const command = this.sh(`npm publish --registry ${this.params.registryUrl}`);
        if (command.stderr.toString().indexOf('pre-existing version') >= 0) {
          this.logger.info('#cyan', names.name, '(', npm.version, ') ->', '#grey', '( npm publish ) ->', '#green', this.params.registryDomain, '-', '#green', 'Already published!');
        } else {
          this.logger.info('#cyan', names.name, '(', npm.version, ') ->', '#grey', '( npm publish ) ->', '#green', this.params.registryDomain, '-', command.status === 0 ? '#green' : '#red', command.status === 0 ? 'OK' : 'ERROR');
        }
        this.logger.trace(command.stdout.toString(), command.stderr.toString());
        return command.status;
      }
      return -1;
    },
    _doCheck() {
      this.params.registryUrl = `${this.params.registryProtocol}://${this.params.registryDomain}/${this.params.registryBase}/${this.params.registries.npm.registry}`;
      return this._checkNpm();
    },
    _checkNpm() {
      let npmconf = this.sh('npm config get registry');
      if (npmconf.status === 0) {
        if (npmconf.stdout.toString().trim() !== this.params.registryUrl) {
          this._getCacheKeys();
          const promise = this.inquire('promptsKey');
          if (promise) {
            return promise
              .then(() => this._setCacheKeys())
              .then(() => this._writeNpmrc());
          } else {
            return this._writeNpmrc();
          }
        } else {
          this.logger.trace('#cyan', 'npm', 'registry already configured', '#green', 'OK');
          return Promise.resolve();
        }
      } else {
        this.logger.error(npmconf);
        return Promise.reject();
      }
    },

    _toObject(text) {
      const result = {};
      const lines = text.split('\n');
      lines.forEach((line) => {
        if (line.indexOf('=') >= 0) {
          const pair = line.split('=');
          result[pair[0].trim()] = pair[1].trim();
        }
      });
      return result;
    },

    _writeNpmrc() {
      let command = 'npm config set registry';
      const tmp = this.sh(`${command} ${this.params.registryUrl}`, null, true);
      if (tmp.status === 0) {
        command = `curl -u${this.params.email}:${this.params.apikey} ${this.params.registryProtocol}://${this.params.registryDomain}/${this.params.registryBase}/${this.params.registries.npm.auth} --insecure`;
        const curl = this.sh(command);
        if (curl.status === 0) {
          if (this.params.registryCa && this.params.registryCa.length > 0) {
            const catfile = path.join(__dirname, 'ca_not_trust.ca');
            fs.writeFileSync(catfile, this.params.registryCa);
            this.sh(`npm config set cafile ${catfile}`, null, true);
          } else {
            this.sh('npm config delete cafile', null, true);
          }
          const artiConfig = this._toObject(curl.stdout.toString());
          Object.getOwnPropertyNames(artiConfig).forEach((param) => {
            this.sh(`npm config set ${param} ${artiConfig[param]}`, null, true);
          });
          this.sh(`npm config set email ${this.params.email}@${this.params.yourdomain}`, null, true);
          this.logger.trace('#cyan', 'npm', 'registry configured', '#green', 'OK');
          return Promise.resolve();
        } else {
          this.logger.error('command:', command, '#red', 'ERROR:', curl.stdout.toString(), curl.stderr.toString());
        }
      }
      return Promise.reject(`Error executing ${command}...`);
    }
  }
};