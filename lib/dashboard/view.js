/*
Copyright 2015 Hewlett-Packard Development Company, L.P.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

 var blessed = require('blessed')
     , contrib = require('blessed-contrib')
     , Model = require('./model')
     , chalk = require('chalk')
     
var coords = 
      { 'aws-us-east-1': {"lon" : "-79.0000", "lat" : "37.5000" }      
      , 'aws-us-west-1': {"lon" : "-122.4167", "lat" : "37.7833" }
      , 'aws-us-west-2': {"lon" : "-122.6819", "lat" : "45.5200" }
      , 'aws-eu-west-1': {"lon" : "-6.2597", "lat" : "53.3478" }
      , 'aws-sa-east-1': {"lon" : "-46.6333", "lat" : "-23.5500" }
      , 'aws-ap-southeast-1': {"lon" : "103.8000", "lat" : "1.3000" }
      , 'hpcs-us-west': {"lon" : "-115.1739", "lat" : "36.1215" }
      , 'hpcs-us-east': {"lon" : "-79.0000", "lat" : "37.5000" } } 

function Dashboard(options) {
  this.model = new Model(options)
  this.dashboardInitialized = false
  this.initializingStatusNotified = false
  this.loginNotified = false
  this.screen = this.grid = this.vusers = this.hits = this.throughput = 
                this.map = this.errors =this.trt = this.tpst = this.errorsTable
                = this.statusBox = null
  this.initUI = initUI
  this.refreshUI = refreshUI
}

Dashboard.prototype.display = function() {
  
  var self = this

  if (!this.loginNotified) {
    console.log("Please wait while we connect to the Storm server...")
    this.loginNotified = true
  }

  var model = this.model
  model.fetch(function(err) {

    if (err) throw err

    self.refreshUI()
    if (model.status.ui_status=="INITIALIZING" || model.status.ui_status=="CHECKING_STATUS") {      
         setTimeout(self.display.bind(self), 2000)
    }
    if (model.status.ui_status=="RUNNING" || model.status.ui_status=="STOPPING") {
         setTimeout(self.display.bind(self), 0)
    }

  })
}


function generateTpsTable(data) {

   var res = []

   for (var i=0; i<data.length; i++) {
     var row = []
     var curr = data[i]
     
     var sum = 0
       , max = null
       , min = null
       , avg = null
       
     for (var j=0; j<curr.y.length; j++) {
       var val = curr.y[j]
       sum += val
       if (max==null || val > max) max = val
       if (min==null || val < min) min = val
     }
     avg = curr.y.length==0 ? 0 : sum / curr.y.length

     row.push(curr.specifics.transaction_name)
     row.push(avg==null?"":avg.toFixed(2))
     row.push(max==null?"":max.toFixed(2))
     row.push(min==null?"":min.toFixed(2))

     res.push(row)
   }

   return res
}

function initUI() {
   var self = this

   this.screen = blessed.screen()   
   this.grid = new contrib.grid({rows: 6, cols: 6, screen: this.screen})
   
   this.vusers = this.grid.set(0, 1, 2, 2, contrib.line, 
     { style: 
       { line: "yellow"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , showLegend: true
     , wholeNumbersOnly: true
     , label: 'Vusers'})

   this.hits = this.grid.set(2, 0, 2, 2, contrib.line, 
     { style: 
       { line: "blue"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , showLegend: true
     , label: 'Hits Per Second'})

   this.throughput = this.grid.set(0, 5, 2, 1, contrib.line, 
     { style: 
       { line: "blue"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , showLegend: true
     , legend: {width: 5}
     , label: 'Throughput (kb/sec)'})

   
  this.statusBox = this.grid.set(0, 0, 2, 1, blessed.box, 
     { style: 
       { line: "blue"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5      
     , tags: true
     , label: 'Run Status'})


   this.map = this.grid.set(0, 3, 2, 2, contrib.map, {label: 'Load Locations'})

   this.errors = this.grid.set(5, 0, 1, 2, contrib.line, 
     { style: 
       { line: "red"
       , text: "white"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , wholeNumbersOnly: true
     , label: 'Total Errors'})


    this.trt = this.grid.set(2, 2, 3, 4, contrib.line, 
     { style: 
       { line: "blue"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , showLegend: true
     , legend: {width: 20}
     , label: 'Transaction Response Time (sec)'})

     this.tpst = this.grid.set(4, 0, 1, 2, contrib.table, 
      { keys: true
      , fg: 'green'
      , label: 'Transactions Per Second'
      , columnSpacing: 0
      , columnWidth: [30, 10, 10, 10]})

     this.errorsTable = this.grid.set(5, 2, 1, 4, contrib.table, 
      { keys: true
      , fg: 'green'
      , label: 'Errors'
      , columnWidth: [20, 75, 10]})
    
    this.screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });
   
    this.dashboardInitialized = true
}

function colorStatus(status) {

  if (status=='FAILED') return chalk.red(status)
  if (status=='SYSTEM_ERROR') return chalk.red(status)
  if (status=='RUNNING') return chalk.blue(status)
  if (status=='PASSED') return chalk.green(status)

  return chalk.white(status)
}


function padLeft(str, length) {
   var tmp = '000000' + str
   return (tmp).slice(tmp.length-length);
};

function formatSeconds(mili) {
  var total_sec = mili/1000
  var hours = Math.floor(total_sec / 60 / 60)
  var minutes = Math.floor((total_sec-(hours*60*60))/60)
  var sec = Math.round((total_sec-minutes*60))
  return padLeft(hours, 2) + ':' + padLeft(minutes, 2) + ':' + padLeft(sec, 2)
}

function getStatusStr(status) {

  var res = chalk.green('status: ') + colorStatus(status.ui_status) + '\r\n'

  if (status.ui_status=="RUNNING") {
    res += chalk.green('duration: ') + formatSeconds(new Date() - new Date(status.loadTestBeginTime)) 
        +  ' / ' + formatSeconds(status.expectedDuration)
  }
  else if (status.ui_status=="PASSED" || status.ui_status=="FAILED" || status.ui_status=="STOPPING") {
    res += chalk.green('duration: ') + formatSeconds(status.loadTestEndTime - status.loadTestBeginTime)
  }


  return res
}

function refreshUI() {
  
   var self = this

   var colors = ['red', 'blue', 'yellow', 'magenta', 'green', 'cyan', 'white']
   var model = this.model
   
   if (model.status.ui_status=="INITIALIZING" || model.status.ui_status=="CHECKING_STATUS") {
      if (!this.initializingStatusNotified) {
        process.stdout.write('Please wait while the test is being initialized.')
        this.initializingStatusNotified = true
      }
      process.stdout.write('.')
   }
   else {
      
      if (!this.dashboardInitialized) {
        this.initUI()

        var refreshStatus = function() {
          var statusStr = getStatusStr(self.model.status)
          self.statusBox.setContent(statusStr)
          self.screen.render()
        }

        if (model.status.ui_status=="RUNNING") {
          setInterval(refreshStatus, 500)
        }
        else {
          refreshStatus()
        }

      }

      var vusersData = []
        , hitsData = []
        , throughputData = []
      
        
      //run over all series of geography based data
      //max 5 lines in chart
      for (var i=0; i<Math.min(model.data.vusers.length, 4); i++) {        
        
        if (model.data.vusers[i]) {
          vusersData.push( { x: model.data.vusers[i].x
                   , y: model.data.vusers[i].y
                   , title: model.data.vusers[i].specifics.geo_location
                   , style: {line: colors[i%colors.length]}})
        }

        if (model.data.hits[i]) {
            hitsData.push( { x: model.data.hits[i].x
                   , y: model.data.hits[i].y
                   , title: model.data.hits[i].specifics.geo_location
                   , style: {line: colors[i%colors.length]}})  
        }

        if (model.data.throughput[i]) {
          var throughputY = model.data.throughput[i].y.slice()
          throughputY.forEach(function(val, i) {
            throughputY[i] = val / 1024
          })
          throughputData.push( { x: model.data.throughput[i].x
                     , y: throughputY
                     , title: "all"// model.data.throughput[i].specifics.geo_location
                     , style: {line: 'yellow'}})
        }
      }

      var errorsData = []
      if (model.data.errors && model.data.errors[0]) {
          errorsData = [{ x: model.data.errors[0].x
                   , y: model.data.errors[0].y                   
                    }]
      }      
      
      var trtData = []
       // , tpsData = []

      //run over all series of transactions based data
      //max 4 lines in chart
      for (var i=0; i<Math.min(model.data.trt.length, 4); i++) {  
        trtData.push( { x: model.data.trt[i].x
                   , y: model.data.trt[i].y
                   , title: model.data.trt[i].specifics.transaction_name
                   , style: {line: colors[i%colors.length]}})      
      }

      if (vusersData.length>0) this.vusers.setData(vusersData)
      if (hitsData.length>0) this.hits.setData(hitsData)
      if (throughputData.length>0) this.throughput.setData(throughputData)
      if (errorsData.length>0) this.errors.setData(errorsData)
      if (trtData.length>0) this.trt.setData(trtData)

      if (model.data.tps.length>0) {
        var data = generateTpsTable(model.data.tps)
        this.tpst.setData({headers: ['', 'Avg', 'Max', 'Min'], data: data})
      }

      for (var i=0; i<model.data.locations.length; i++) {         
         var geo = coords[model.data.locations[i]]
         if (geo) this.map.addMarker({"lon" : geo.lon, "lat" : geo.lat, color: 'red', char: 'X' })
         //else console.log("no available coordinates to: " + geo)
      }

      var errorsList = []
      for (var i=0; i<model.data.errorsList.length; i++) {        
        var curr = model.data.errorsList[i]        
        errorsList.push([curr.script_name, curr.message, curr.total_errors])
      }      

      this.errorsTable.setData({headers: ['script', 'message', 'count'], data: errorsList})

      this.screen.render()
   }

}

module.exports = Dashboard
