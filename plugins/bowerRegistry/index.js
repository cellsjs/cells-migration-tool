'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {

  check: function() {
    if (this.params.stages.indexOf('check') >= 0) {
      return this._checkBower();
    }
  },

  run: function() {
    if (this.params.stages.indexOf('run') >= 0) {
      return this._checkBower();
    }
  },

  addons: {

    _bowerNotPrivate() {
      const bowerFile = 'bower.json';
      const bower = this.fsReadConfig(bowerFile);
      if (bower.private) {
        this.logger.info('deleting private from bower.json');
        delete bower.private;
        fs.writeFileSync(bowerFile, JSON.stringify(bower, null, 2));
      }
      return bower;
    },

    registerBower() {
      const bower = this._bowerNotPrivate();
      const names = this.checkNames(bower);
      if (names) {
        const command = this.sh(`bower register -f ${names.name} ${names.url}`);
        this.logger.info('#cyan', names.name, '#grey', '( bower register ) ->', '#green', this.params.registryDomain, '-', command.status === 0 ? '#green' : '#red', command.status === 0 ? 'OK' : 'ERROR');
        this.logger.trace(command.stdout.toString(), command.stderr.toString());
        return command.status;
      }
      return -1;
    },

    checkNames(config) {
      const remote = this.sh('git remote -v|awk \'{print $2}\'|uniq');
      const url = remote.stdout.toString();
      const names = url.split('/');
      if (remote.status === 0 && names.length > 0) {
        const name = names[names.length - 1].replace('.git\n', '');
        if (config.name === name) {
          return {name: name, url: url.replace('\n', '')};
        } else {
          this.logger.warn('#cyan', name, '#grey', '( bower register ) ->', '#green', this.params.registryDomain, '-> bower name is:', '#cyan', config.name, '- repo name is:', '#cyan', name, '-', '#red', 'ERROR');
        }
      } else {
        this.logger.warn('#red', `impossible to get remote url! error: ${remote.stderr.toString()}`);
      }
      return false;
    },

    _writeBowerrc() {
      if (!this.params.bowerrc.resolvers) {
        this.params.bowerrc.resolvers = [];
      }
      if (this.params.bowerrc.resolvers.indexOf(this.params.resolver) < 0) {
        this.params.bowerrc.resolvers.push(this.params.resolver);
      }
      this.params.bowerrc.registry = `${this.params.registryProtocol}://${this.params.email}:${this.params.apikey}@${this.params.registryDomain}/${this.params.registryBase}/${this.params.registries.bower.registry}`;
      this.params.bowerrc['strict-ssl'] = false;
      fs.writeFileSync(this.params.bowerrcFile, JSON.stringify(this.params.bowerrc, null, 2));
      this.logger.trace('#cyan', this.params.resolver, 'and', '#cyan', 'bower', 'registry configured', '#green', 'OK');
    },

    _checkBower() {
      this.params.bowerrcFile = path.join(process.env.HOME, '.bowerrc');
      this.params.bowerrc = {};
      if (this.fsExists(this.params.bowerrcFile)) {
        this.params.bowerrc = this.fsReadConfig(this.params.bowerrcFile);
      }
      this.params.bowerRegistry = `${this.params.registryProtocol}://${this.params.email}:${this.params.apikey}@${this.params.registryDomain}/${this.params.registryBase}/${this.params.registries.bower.registry}`;
      if (this.params.bowerrc.registry && this.params.bowerrc.registry === this.params.bowerRegistry) {
        this.logger.trace('#cyan', this.params.resolver, 'and', '#cyan', 'bower', 'registry are already configured', '#green', 'OK');
        return Promise.resolve();
      } else {
        this._getCacheKeys();
        const promise = this.inquire('promptsKey');
        if (promise) {
          return promise
            .then(() => this._setCacheKeys())
            .then(() => this._writeBowerrc());
        } else {
          return this._writeBowerrc();
        }
      }
    }
  }
};
