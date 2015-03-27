
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
       , text: "white"
       , baseline: "black"}
     , xLabelPadding: 3
     , xPadding: 5
     , label: 'Hits'})
   

grid.applyLayout(screen)
   
model.fetch(refresh)   

function refresh() {

   if (model.status.ui_status=="INITIALIZING") {      
         throw "test is still initializing..."
   }
   else {
      var vusers = grid.get(0, 0)
      var hits = grid.get(0, 1)   

      vusers.setData([{x: model.data.vusers[0].x, y: model.data.vusers[0].y, title: 'all'}])
      hits.setData([{x: model.data.hits[0].x, y: model.data.hits[0].y}])         
   }

   
   screen.key(['escape', 'q', 'C-c'], function(ch, key) {
     return process.exit(0);
   });

   screen.render()
}