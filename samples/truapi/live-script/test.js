var r = require('request')

module.exports = function (vuser) {

  vuser.action('Flow', function (svc, done) {
    
    svc.transaction.start('map');

    r("http://ec2-23-21-64-152.compute-1.amazonaws.com/?type=map", function(err, res, body) {
      
      if (res.statusCode != 200 || err) {
        svc.logger.error("status code is: " + res.statusCode + ". err is: " + err);
        svc.transaction.end('map', svc.transaction.FAIL);
        done()
        return
      }
      
      svc.transaction.end('map', svc.transaction.PASS);
      done()
    })  

  });

};
