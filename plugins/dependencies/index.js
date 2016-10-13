'use strict';

const fs = require('fs');
const semver = require('semver');

function getVersion(str) {
  const items = str.match(/\#(.*?)$/);
  if (items && items.length > 0) {
    if (semver.validRange(items[1])) {
      return items[1];
    } else {
      return str;
    }
  } else {
    return '*';
  }
}

function appendRange(version, add) {
  if (add) {
    if (semver.valid(version)) {
      version = add + version;
    }
  }
  return version;
}

module.exports = {

  addons: {

    _chDependency(dependency, toVersions) {
      if (toVersions) {
        return appendRange(getVersion(dependency), this.params.rangeAppend);
      } else {
        return this.gitChangeOrigin(dependency);
      }
    },

    d2r(configFile) {
      if (this.fsExists(configFile)) {
        const model = this.fsReadConfig(configFile);
        let hasChanged = false;
        ['dependencies', 'devDependencies'].forEach((type) => {
          if (model[type]) {
            Object.getOwnPropertyNames(model[type]).forEach((name) => {
              let dependency = model[type][name];
              const repoDomain = this.params.fromRepo.split('/')[0];
              if (dependency.indexOf(repoDomain) >= 0) {
                hasChanged = true;
                model[type][name] = this._chDependency(dependency, this.params.toVersions);
                this.logger.info('#cyan', name, ':', model[type][name], '#green', 'OK');
              }
            });
          }
        });
        if (hasChanged) {
          fs.writeFileSync(configFile, JSON.stringify(model, null, 2));
        }
      }
    }
  }

};
