module.exports = {
  checkEmail(email) {
    return email.replace(/@.*/, '');
  },
  check() {
    this.logger.info('registry:', '#cyan', this.params.registryDomain, 'is configured', '#green', 'OK');
  }
};