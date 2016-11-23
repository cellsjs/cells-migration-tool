module.exports = {
  check() {
    this.logger.info('registry:', '#cyan', this.params.registryDomain, 'is configured', '#green', 'OK');
  }
};