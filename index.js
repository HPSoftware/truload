var argv = require('optimist').argv;
var command = process.argv[2]

var options = { tenant_id: argv.tid
              , url: argv.url || "https://stormrunner-load.saas.hp.com/"
              , user: argv.u
              , password: argv.p
              , proxy: argv.proxy
              , skipLogin: argv.skipLogin }


if (command=='dashboard') {  
  var Dashboard = require('./lib/dashboard/view.js')
  options.run_id = argv.rid
  var d = new Dashboard(options)
  d.display()  
}
else if (command=='run') {
  var TestManagement = require('./lib/mgmt/model')
  var m = new TestManagement(options)
  m.uploadAndRun()
}
else if (command=='stop') {
  var TestManagement = require('./lib/mgmt/model')
  options.run_id = argv.rid
  var m = new TestManagement(options)
  m.stopRun()
}
else {
  console.log("unknown command")
}

