var sourceO = new ol.source.Vector({});
var sourceP = new ol.source.Vector({});
var sourceR = new ol.source.Vector({});
var source = new ol.source.Vector({});


// Drawing layer for Pistes, Routes and ouvrages
var ouvrages = new ol.layer.Vector({
        source: sourceO,
        style: new ol.style.Style({
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          })
        })
      });

var pistes = new ol.layer.Vector({
        source: sourceP,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'black'
          }),
          stroke: new ol.style.Stroke({
            color: '#589f3c',
            width: 2
          })
        })
      });

var routes = new ol.layer.Vector({
        source: sourceR,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'black'
          }),
          stroke: new ol.style.Stroke({
            color: '#4d4d4d',
            width: 2
          })
        })
      });


// Administrative boundaries overlay
var limitesAdm = new ol.layer.Vector({
            source: new ol.source.Vector({
              url: '../geojson/burkina_faso_administrative.geojson',
              format: new ol.format.GeoJSON()
            })

          });

// Roads network overlay
var roadsNetwork = new ol.layer.Vector({
                  source: new ol.source.Vector({
                    url: '../geojson/burkina_faso_roads.geojson',
                    format: new ol.format.GeoJSON()
                  }),
                  style: new ol.style.Style({
                    stroke: new ol.style.Stroke({color: 'red', width: 2})
                  })
                });

// Create the map and add OSM raster, geojson overlays and drawing layer (ouvrages)
var map = new ol.Map({
        target: 'map',
        layers: [new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
          ouvrages,pistes,routes,limitesAdm,roadsNetwork],

        view: new ol.View({
          center: ol.proj.fromLonLat([-1.5338800, 12.3656600]),
          zoom: 7
        })
      });


var draw, snap; // global so we can remove them later
var typeSelect = document.getElementById('type'); // save in a variable the selected element in the dropdown menu (Ouvrage, Piste or Route)

function returnActiveLayer()
{
if (typeSelect.value == "Route") {return routes;}
else if (typeSelect.value == "Piste") {return pistes;}
else if (typeSelect.value == "Ouvrage") {return ouvrages;}
}

function returnType()
{
if (typeSelect.value == "Ouvrage") {return 'Point';}
else {return 'LineString';}
}




var modify = new ol.interaction.Modify({source: returnActiveLayer().getSource()});
map.addInteraction(modify);

//
function addInteractions() {
  draw = new ol.interaction.Draw({
    source: returnActiveLayer().getSource(),
    type: returnType()
  });
  map.addInteraction(draw);

  snap = new ol.interaction.Snap({source: returnActiveLayer().getSource()}); // Implement snapping to connect lines from multiple drawing of routes/pistes
  map.addInteraction(snap);

  draw.on('drawend', function(evt){

    if (returnActiveLayer()==ouvrages){
    document.getElementById("formOuvrage").style.display = 'block';
    }

    else if (returnActiveLayer()==routes){
      document.getElementById("formRoute").style.display = 'block';
    }

    else if (returnActiveLayer()==pistes){
      document.getElementById("formPiste").style.display = 'block';
    }
  });


}







//
// map.on('dblclick', function(evt) {
//   if (returnActiveLayer()==ouvrages){
//   document.getElementById("formOuvrage").style.display = 'block';
//   }
//
//   else if (returnActiveLayer()==routes){
//     document.getElementById("formRoute").style.display = 'block';
//   }
//
//   else if (returnActiveLayer()==pistes){
//     document.getElementById("formPiste").style.display = 'block';
//   }
//
// });



      /**
       * Handle change event.
       */
      typeSelect.onchange = function() {
        map.removeInteraction(draw); // openlayer method to remove the given interaction from the map
        map.removeInteraction(snap);
        addInteractions();
      };

      addInteractions();






    function closeForm() {
      if (returnActiveLayer()==ouvrages && document.getElementById("formOuvrage").style.display == 'block'){
                document.getElementById("formOuvrage").style.display = 'none';
      }

      if (returnActiveLayer()==routes &&   document.getElementById("formRoute").style.display == 'block'){
                document.getElementById("formRoute").style.display = 'none';
      }

      if (returnActiveLayer()==pistes &&  document.getElementById("formPiste").style.display == 'block'){
                document.getElementById("formPiste").style.display = 'none';
      }
    }



// Funtion to display or not the geojson layers (use for limitesAdm and roadsNetwork)
function hideShow(layer) {
  if(layer.getVisible(true)) {
    layer.setVisible(false)}
else { layer.setVisible(true)}
}
