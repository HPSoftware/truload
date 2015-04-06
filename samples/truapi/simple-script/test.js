
module.exports = function (vuser) {
  /* init action */
  vuser.init('Base Vuser init', function (svc, done) {
    svc.logger.info('Vuser %s init', vuser.getVUserId());
    done();
  });

  /* main action */
  vuser.action('Base Vuser action', function (svc, done) {
    svc.logger.error('The server has returned an HTTP 500 status', vuser.getVUserId());

    svc.transaction.start('tran1');
    svc.transaction.end('tran1', svc.transaction.PASS);

    svc.transaction.start('yaron');
    function test() {
      svc.transaction.end('yaron', svc.transaction.PASS);
      done();
    }
    setTimeout(test, 500);
  });

  /* end action */
  vuser.end('Base Vuser end', function (svc, done) {
    svc.logger.info('Vuser %s end', vuser.getVUserId());
    done();
  });
};