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
          const filePath = path.join(process.env.HOME, file);
          let content = this.fsReadFile(filePath);
          if (content.indexOf(this.params.registryDomain) >= 0) {
            this.logger.info('file', '#cyan', filePath, 'is already configured!');
          } else {
            eval(`content += \`${this.params.configFiles[file]}\``, this.params);
            fs.writeFileSync(filePath, content);
            this.logger.info('file', '#green', filePath, 'written');
          }
        });
      }
    }

  }
};