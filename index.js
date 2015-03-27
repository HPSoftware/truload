
 var blessed = require('blessed')
     , contrib = require('blessed-contrib')
     , Model = require('./lib/model')
     , model = new Model(1, "yaron")
     , screen = blessed.screen()
     , grid = new contrib.grid({rows: 1, cols: 2})     

   grid.set(0, 0, 1, 1, contrib.line, 
     { style: 
       { line: "yellow"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , showLegend: true
     , label: 'Vusers'})

   grid.set(0, 1, 1, 1, contrib.line, 
     { style: 
       { line: "blue"
       , text: "green"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , showLegend: true
     , label: 'Hits'})
   

grid.applyLayout(screen)
   
model.fetch(refresh)   

function refresh() {


   var colors = ['red', 'blue', 'yellow', 'green', 'cyan', 'magneta', 'white']

   if (model.status.ui_status=="INITIALIZING") {      
         throw "test is still initializing..."
   }
   else {
      var vusers = grid.get(0, 0)
      var hits = grid.get(0, 1)   

      var vusersData = []
      var hitsData = []
      for (var i=0; i<model.data.vusers.length; i++) {
        vusersData.push( { x: model.data.vusers[i].x
                   , y: model.data.vusers[i].y
                   , title: model.data.vusers[i].specifics.geo_location
                   , style: {line: colors[i%colors.length]}})
        hitsData.push( { x: model.data.vusers[i].x
                   , y: model.data.hits[i].y
                   , title: model.data.hits[i].specifics.geo_location
                   , style: {line: colors[i%colors.length]}})
      }
      vusers.setData(vusersData)
      hits.setData(hitsData)

      
   }

   screen.key(['escape', 'q', 'C-c'], function(ch, key) {
     return process.exit(0);
   });

   screen.render()
}