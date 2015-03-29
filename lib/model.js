var r = require('request')
var async = require('async')

var urlPrefix = "http://localhost:3030/"

function RunData(runId, tenantId) {
   this.runId = runId
   this.tenantId = tenantId

   this.data = {}

   this.buildQuery = buildQuery
   this.getTestStatus = getTestStatus
   this.getFinishTime = getFinishTime  
   this.calcLocations = calcLocations 
   this.getTimeSeries = getTimeSeries
   this.getErrors = getErrors
}

RunData.prototype.fetch = function(cba) {

   var self = this

   this.getTestStatus(function(err, status) {
      self.status = status

      async.parallel(
         [ self.getTimeSeries.bind(self)
         , self.getErrors.bind(self)],
         function() {
            cba()
         }
      )      
        
   })   
}

function getTimeSeries(cba) {

   var self = this

   var url = urlPrefix + "api/runtime/results/" + self.runId + "?TENANTID=" + self.tenantId + "&q="

   var query = self.buildQuery(self.status)      
   url += encodeURI(JSON.stringify(query))

   r.get({url: url, json: true}, function(err, res, body) {         

      for (metric in body) {            
         self.data[metric] = []
         for (var i=0; i<body[metric].data.length; i++) {
            var breakdown = body[metric].data[i]
            var item = {x: [], y: []}
            item.specifics = breakdown.specifics
            for (var j=0; j<breakdown.values.length; j++) {
               var value = breakdown.values[j]

               var sec = new Number(value.x)/1000
               var min = sec / 60
               var secStr = pad(sec%60, 2)
               var minStr = pad(min.toFixed(0), 2)

               item.x.push(minStr+':'+secStr)
               item.y.push(new Number(new Number(value.y).toFixed(0)))
            }
            self.data[metric].push(item)               
         }

      }

      self.calcLocations()

      cba()
   })       
}

function getErrors(cba) {
   var self = this
   var url = urlPrefix + "api/runtime/errors/" + self.runId + "?TENANTID=" + self.tenantId + "&q=%7B%22lastTimeStamp%22:0%7D"

   r.get({url: url, json: true}, function(err, res, body) {
      self.data.errorsList = body
      cba()
   })
}

function calcLocations() {
   var locations = []
   for (var i=0; i<this.data.vusers.length; i++) {
      locations.push(this.data.vusers[i].specifics.geo_location)
   }
   this.data.locations = locations   
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function getFinishTime(status) {
   var res = 1000*60*5;

   if (status.ui_status=="INITIALIZING") {      
      return res
   }
   if (status.ui_status=="RUNNING") {
     var delay = 15000 //do not ask about too recent values since they may not arrived yet
     res =  Math.max(Date.now()-status.loadTestBeginTime-delay, 5000)
   }
   else {
     res = status.loadTestEndTime-status.loadTestBeginTime     
   }

   return res
}

function getTestStatus(cba) {
   var prefix = "http://localhost:3030/"
   var url = prefix + "api/test-runs/" + this.runId + "/status?TENANTID=" + this.tenantId
   r({url: url, json: true}, function(err, res, data){
      cba(err, data)
   })   
}

function buildQuery(status) {
   
   var end = this.getFinishTime(status)

   var res = {
      "vusers": 
         { metric:"user_count"
         , category:"user_count"
         , points: 35
         , startTime:0
         , endTime: end
         , groupBy: ["geo_location"]
         },
      "hits":
         { metric: "hits_per_sec"
         , category: "client"
         , points: 35
         , startTime: 0
         , endtime: end
         , groupBy: ["geo_location"]
         },
      "throughput":
         { metric: "mic_recv"
         , category: "client"
         , points: 35
         , startTime: 0
         , endtime: end
         , groupBy: ["geo_location"]
         },
      "errors":
         { metric: "errors"
         , category: "errors"
         , points: 10
         , startTime: 0
         , endtime: end
         //, groupBy: ["geo_location"]
         },
      "trt":
         { metric: "trt"
         , category: "transactions"
         , points: 35
         , startTime: 0
         , endtime: end
         , groupBy: ["script_id","transaction_name"]
         },
      "tps":
         { metric: "tps"
         , category: "transactions"
         , points: 35
         , startTime: 0
         , endtime: end
         , groupBy: ["script_id","transaction_name"]
         }
   }   

   return res
}

module.exports = RunData
