'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {

  check: function() {
    if (this.params.stages && this.params.stages.indexOf('check') >= 0) {
      return this._writeFiles();
    }
  },

  addons: {

    _writeFiles() {
      if (this.params.configFiles) {
        Object.getOwnPropertyNames(this.params.configFiles).forEach((file) => {
          let content = '';
          if (this.fsExists(file)) {
            content = this.fsReadFile(file)+ '\n';
            if (content.indexOf(this.params.registryDomain) >= 0) {
              this.logger.info('file', '#cyan', file, 'is already configured!');
              content = undefined;
            }
          }
          if (content !== undefined) {
            eval(`content += \`${this.params.configFiles[file]}\``, this.params);
            fs.writeFileSync(path.join(process.env.HOME, file), content);
            this.logger.info('file', '#green', file, 'written');
          }
        });
      }
    }

  }
};