//Define projection
proj4.defs('EPSG:32630', '+proj=utm +zone=30 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ');

if ( ol.proj.get('EPSG:32630') ) {
  console.log("ol.proj.get().getCode: " + ol.proj.get('EPSG:32630').getCode())
} else {
  console.log("FAILED ol.proj.get(): " + 'EPSG:32630');
}

var sourceO = new ol.source.Vector({format:new ol.format.GeoJSON(), projection:'EPSG:4326',
  loader : function(extent,resolution,projection) {
    loadData('/ouvragesfromDB',sourceO,function(layerSrc, features) {addFeaturestoSource(layerSrc, features)});
  }});
var sourceR = new ol.source.Vector({format:new ol.format.GeoJSON(), projection:'EPSG:32630',
  loader : function(extent,resolution,projection) {
    loadData('/routesfromDB',sourceR,function(layerSrc, features) {addFeaturestoSource(layerSrc, features)});
  }});
var sourceP = new ol.source.Vector({format:new ol.format.GeoJSON(), projection:'EPSG:32630',
  loader : function(extent,resolution,projection) {
    loadData('/pistesfromDB',sourceP,function(layerSrc, features) {addFeaturestoSource(layerSrc, features)});
  }});

var source = new ol.source.Vector({});
var tempFeature;
var lastFeature;
var select = new ol.interaction.Select();
var selectedFeatureID;

// Drawing layer for Pistes, Routes and ouvrages
var ouvrages = new ol.layer.Vector({
        name:'ouvrages',
        source: sourceO,
        style: new ol.style.Style({
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#fdaf27'
            })
          })
        })
      });

var pistes = new ol.layer.Vector({
        name: 'pistes',
        source: sourceP,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'black'
          }),
          stroke: new ol.style.Stroke({
            color: '#589f3c',
            width: 1
          })
        })
      });

var routes = new ol.layer.Vector({
        name: 'routes',
        source: sourceR,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'black'
          }),
          stroke: new ol.style.Stroke({
            color: '#4d4d4d',
            width: 1
          })
        }),
      });


// Administrative boundaries overlay
var limitesAdm = new ol.layer.Vector({
            source: new ol.source.Vector({
              url: '/mapjson/burkina_faso_administrative',
              format: new ol.format.GeoJSON(),
              projection: 'EPSG:4326'
            })

          });




function loadData(url,layerSrc,callback) {
  var request = window.superagent;
  request
    .get(url)
    .end(function (err,res){
      if(err) {
        return callback(null,null,'Erreur de connexion au serveur, ' + err.message);
      }
      if(res.status !==200){
        return callback(null,null,res.text);
      }

      console.log(url);
      var olFeatures = [];
      var data = JSON.parse(res.text);

      // Read GeoJSON file for Ouvrages

      if(url=='/ouvragesfromDB'){

        for(i=0; i < data.length; i++) {
          var geojsonFeature = {
            'type' : 'Feature',
            'properties' :{
              'id': data[i]._id,
              'nameO': data[i].properties.nameO,
              'typeO': data[i].properties.typeO,
              'date_constructionO': data[i].properties.date_constructionO,
              'urgence_intervO': data[i].properties.urgence_intervO,
              'plan_PDFO': data[i].properties.plan_PDFO
            },
            'geometry':{
              'type':'Point',
              'coordinates': [Number(data[i].geometry.coordinates[0]), Number(data[i].geometry.coordinates[1])]
            },
          };
          var reader = new ol.format.GeoJSON();
          var olFeature = reader.readFeature(geojsonFeature);
          sourceO.addFeature(olFeature); //add to Ouvrages layer
          console.log(olFeature);
        }
      }

      // Read GeoJSON file for pistes and routes

      else {

        for (i=0; i<data.length; i++){

          var reader = new ol.format.GeoJSON();
          var olFeature = reader.readFeature(data[i], {featureProjection: 'EPSG:3857',
              dataProjection: 'EPSG:4326'});

          olFeature.model = data[i];
          olFeatures.push(olFeature);
      };

      }

      return callback(layerSrc, olFeatures);
    });
}


var addFeaturestoSource = function(layerSrc, features, msg) {
  if(msg != null)
    console.log(msg);
  else
    layerSrc.addFeatures(features);
}



var bingMapsAerial = new ol.layer.Tile({
        preload: Infinity,
        source: new ol.source.BingMaps({
          key: 'Alif4W4K6gbOy6pYY5XEGKvdwRGAt5cq46GePgEgOQEobUea2kN6F-zXW5HmuZSP',
          imagerySet: 'Aerial',
        })
      });

var layersOSM = new ol.layer.Tile({
            source: new ol.source.OSM()
        });

var layers_stamen = new ol.layer.Tile({
            source: new ol.source.Stamen({layer: 'toner'})
        });



var layersGroup = [bingMapsAerial,layers_stamen, layersOSM];

// Create the map and add OSM raster, geojson overlays and drawing layer (ouvrages)
var map = new ol.Map({
        target: 'map',
        projection: 'EPSG:3857',
        layers: layersGroup,
        view: new ol.View({
          renderer:'canvas',
          center:ol.proj.fromLonLat([-1.5338800, 12.3656600]),
          zoom: 7
        })
      });

map.addLayer(routes);
map.addLayer(pistes);
map.addLayer(ouvrages);
map.addLayer(limitesAdm);

//Set basemap type
var e = document.getElementById("raster");

function changeRaster() {
  var raster_selected = e.options[e.selectedIndex].value;

  if (raster_selected==='OSM') {
  layersOSM.setVisible(true);
  layers_stamen.setVisible(false);
  bingMapsAerial.setVisible(false);
}
  else if (raster_selected==='stamen') {
    layers_stamen.setVisible(true);
    layersOSM.setVisible(false);
    bingMapsAerial.setVisible(false);
}  else if (raster_selected==='aerial') {
    bingMapsAerial.setVisible(true);
    layers_stamen.setVisible(false);
    layersOSM.setVisible(false);
}
}
