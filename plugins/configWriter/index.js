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
          let content;
          eval(`content = \`${this.params.configFiles[file]}\``, this.params);
          fs.writeFileSync(path.join(process.env.HOME, file), content);
        });
      }
    }

  }
};