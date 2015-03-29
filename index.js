
 var blessed = require('blessed')
     , contrib = require('blessed-contrib')
     , Model = require('./lib/model')
     , model = new Model(1, "yaron")
     , screen = blessed.screen()
     , grid = new contrib.grid({rows: 6, cols: 6})     

   grid.set(2, 0, 2, 2, contrib.line, 
     { style: 
       { line: "yellow"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , showLegend: true
     , label: 'Vusers'})

   grid.set(0, 2, 2, 2, contrib.line, 
     { style: 
       { line: "blue"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , showLegend: true
     , label: 'Hits'})

   grid.set(0, 4, 2, 2, contrib.line, 
     { style: 
       { line: "blue"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , showLegend: true
     , label: 'Throughput (kb/sec)'})

   grid.set(0, 0, 2, 2, contrib.map, {label: 'Load Locations'})

   grid.set(5, 0, 2, 1, contrib.line, 
     { style: 
       { line: "red"
       , text: "white"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     //, showLegend: true
     , label: 'Total Errors'})


    grid.set(2, 2, 4, 3, contrib.line, 
     { style: 
       { line: "blue"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , showLegend: true
     , legend: {width: 20}
     , label: 'Transaction Response Time (sec)'})

/*
     grid.set(2, 4, 2, 3, contrib.line, 
      { style: 
        { line: "blue"
        , text: "green"
        , baseline: "black"}
      , xLabelPadding: 3
      , xPadding: 5
      , showLegend: true
      , legend: {width: 20}
      , label: 'Transactions Per Second'})
 */

     grid.set(4, 0, 2, 1, contrib.table, 
      { keys: true
      , fg: 'green'
      , label: 'Transactions Per Second'
      , columnSpacing: 0
      , columnWidth: [30, 10, 10, 10]})

     grid.set(5, 2, 4, 1, contrib.table, 
      { keys: true
      , fg: 'green'
      , label: 'Errors'
      , columnWidth: [20, 75, 10]})


grid.applyLayout(screen)
var vusers = grid.get(2, 0)
  , hits = grid.get(0, 2)   
  , throughput = grid.get(0, 4)   
  , map = grid.get(0, 0)   
  , errors = grid.get(5, 0)
  , trt = grid.get(2, 2)
  //, tps = grid.get(2, 4)
  , tpst = grid.get(4, 0)
  , errorsTable = grid.get(5, 2)
   

model.fetch(refresh)   


var coords = 
      { 'aws-us-east-1': {"lon" : "-79.0000", "lat" : "37.5000" }
      , 'aws-us-west-2': {"lon" : "-122.6819", "lat" : "45.5200" }
      , 'aws-eu-west-1': {"lon" : "-6.2597", "lat" : "53.3478" }
      , 'aws-sa-east-1': {"lon" : "-46.6333", "lat" : "-23.5500" }
      , 'aws-ap-southeast-1': {"lon" : "103.8000", "lat" : "1.3000" }
      , 'hpcs-us-west': {"lon" : "-115.1739", "lat" : "36.1215" }
      , 'hpcs-us-east': {"lon" : "-79.0000", "lat" : "37.5000" } } 



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



function refresh() {


   var colors = ['red', 'blue', 'yellow', 'green', 'cyan', 'magneta', 'white']

   if (model.status.ui_status=="INITIALIZING") {      
         throw "test is still initializing..."
   }
   else {

      var vusersData = []
        , hitsData = []
        , throughputData = []
      
        
      //run over all series of geography based data
      //max 5 lines in chart
      for (var i=0; i<Math.min(model.data.vusers.length, 4); i++) {        
        vusersData.push( { x: model.data.vusers[i].x
                   , y: model.data.vusers[i].y
                   , title: model.data.vusers[i].specifics.geo_location
                   , style: {line: colors[i%colors.length]}})

        hitsData.push( { x: model.data.hits[i].x
                   , y: model.data.hits[i].y
                   , title: model.data.hits[i].specifics.geo_location
                   , style: {line: colors[i%colors.length]}})  

        var throughputY = model.data.throughput[i].y.slice()
        throughputY.forEach(function(val, i) {
          throughputY[i] = val / 1024
        })
        throughputData.push( { x: model.data.throughput[i].x
                   , y: throughputY
                   , title: model.data.throughput[i].specifics.geo_location
                   , style: {line: colors[i%colors.length]}})
      }

      var errorsData = [{ x: model.data.errors[0].x
                   , y: model.data.errors[0].y
                   //, title: model.data.errors[0].specifics.geo_location
                   //, style: {line: colors[i%colors.length]}
                    }]
      

      
      var trtData = []
       // , tpsData = []

      //run over all series of transactions based data
      //max 5 lines in chart
      for (var i=0; i<Math.min(model.data.trt.length, 4); i++) {  
        trtData.push( { x: model.data.trt[i].x
                   , y: model.data.trt[i].y
                   , title: model.data.trt[i].specifics.transaction_name
                   , style: {line: colors[i%colors.length]}})
       /* tpsData.push( { x: model.data.tps[i].x
                   , y: model.data.tps[i].y
                   , title: model.data.tps[i].specifics.transaction_name
                   , style: {line: colors[i%colors.length]}})
       */
      }

      vusers.setData(vusersData)
      hits.setData(hitsData)
      throughput.setData(throughputData)
      errors.setData(errorsData)
      trt.setData(trtData)
      //tps.setData(tpsData)

      var data = generateTpsTable(model.data.tps)
      tpst.setData({headers: ['', 'Avg', 'Max', 'Min'], data: data})

      for (var i=0; i<model.data.locations.length; i++) {
         var geo = coords[model.data.locations[i]]
         map.addMarker({"lon" : geo.lon, "lat" : geo.lat, color: 'red', char: 'X' })
      }

      var errorsList = []
      for (var i=0; i<model.data.errorsList.length; i++) {        
        var curr = model.data.errorsList[i]        
        errorsList.push([curr.script_name, curr.message, curr.total_errors])
      }      

      errorsTable.setData({headers: ['script', 'message', 'count'], data: errorsList})
   }

   screen.key(['escape', 'q', 'C-c'], function(ch, key) {
     return process.exit(0);
   });

   screen.render()
}