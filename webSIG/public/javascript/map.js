var draw, snap; // global so we can remove them later
var typeSelect = document.getElementById('type'); // save in a variable the selected element in the dropdown menu (Ouvrage, Piste or Route)


//Define projection
proj4.defs('EPSG:32630', '+proj=utm +zone=30 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ');

if ( ol.proj.get('EPSG:32630') ) {
  console.log("ol.proj.get().getCode: " + ol.proj.get('EPSG:32630').getCode())
} else {
  console.log("FAILED ol.proj.get(): " + 'EPSG:32630');
}

var sourceO = new ol.source.Vector({format:new ol.format.GeoJSON(), projection:'EPSG:3857',
  loader : function(extent,resolution,projection) {
    loadData('/ouvragesfromDB',sourceO,function(layerSrc, features) {addFeaturestoSource(layerSrc, features)});
  }});
var sourceR = new ol.source.Vector({format:new ol.format.GeoJSON(), projection:'EPSG:4326',
  // loader : function(extent,resolution,projection) {
  //   loadData('/routesfromDB',sourceR,function(layerSrc, features) {addFeaturestoSource(layerSrc, features)});
  // }
});
var sourceP = new ol.source.Vector({format:new ol.format.GeoJSON(), projection:'EPSG:4326',
  // loader : function(extent,resolution,projection) {
  //   loadData('/pistesfromDB',sourceP,function(layerSrc, features) {addFeaturestoSource(layerSrc, features)});
  // }
});
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
              color: '#ffcc33'
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
            width: 2
          })
        })
      });

//projection ; new ol.proj.Projection({code:'ESPG:32630'})

var routes = new ol.layer.Vector({
        name: 'routes',
        source: sourceR,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'black'
          }),
          stroke: new ol.style.Stroke({
            color: '#4d4d4d',
            width: 2
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
      var olFeatures = [];
      var data = JSON.parse(res.text);
      

      for (i=0; i<data.length; i++){
        console.log(data[i]);
        var reader = new ol.format.GeoJSON();
        var olFeature = reader.readFeature(data[i]);
 
        olFeature.model = data[i];
        olFeatures.push(olFeature);
      };
      console.log(olFeatures);
      return callback(layerSrc, olFeatures);
    });
}

var addFeaturestoSource = function(layerSrc, features, msg) {
  if(msg != null)
    console.log(msg);
  else 
    layerSrc.addFeatures(features);
}


// Add layers from the DB (created by the user)
// function addOuvragesFromDB() {
//   var request = window.superagent
//   request
//     .get('/ouvragesfromDB')
//     .end(function(err,res) {
//       if (err) {
//         return callback(null,'Erreur de connexion au serveur, ' + err.message);
//       }
//       if (res.status !== 200) {
//         return callback(null, res.text);
//       }
//       var data = JSON.parse(res.text);
//       for(i=0; i < data.length; i++) {
//         var geojsonFeature = {
//           'type' : 'Feature',
//           'properties' :{
//             'idO': data[i]._id,
//             'nameO': data[i].nameO,
//             'typeO': data[i].typeO,
//             'date_constructionO': data[i].date_constructionO,
//             'urgence_intervO': data[i].urgence_intervO,
//             'plan_PDFO': data[i].plan_PDFO
//           },
//           'geometry':{
//             'type':'Point',
//             'coordinates': [Number(data[i].geometry.coordinates[0]), Number(data[i].geometry.coordinates[1])]
//           }
//         };
//         var reader = new ol.format.GeoJSON();
//         var olFeature = reader.readFeature(geojsonFeature);
//         sourceO.addFeature(olFeature); //add to Ouvrages layer

//           }
//     });
// }
//addOuvragesFromDB();
//var center = ol.proj.transform([36, 35], 'EPSG:4326', 'EPSG:3857');
//center: ol.proj.fromLonLat([-1.5338800, 12.3656600]),
//center : ol.proj.transform([36, 35],'ESPG:4326','ESPG:3857'),

// Create the map and add OSM raster, geojson overlays and drawing layer (ouvrages)
var map = new ol.Map({
        target: 'map',
        projection: 'EPSG:4326',
        layers: [new ol.layer.Tile({
            source: new ol.source.OSM()
          })
          ],
        view: new ol.View({
          renderer:'canvas',
          center:ol.proj.fromLonLat([-1.5338800, 12.3656600]),
          zoom: 7
        })
      });

//map.addLayer(routes);
//map.addLayer(pistes);
map.addLayer(ouvrages);
map.addLayer(limitesAdm);


// function returnActiveLayer()
// {
// if (typeSelect.value == "Route") {return routes;}
// else if (typeSelect.value == "Piste") {return pistes;}
// else if (typeSelect.value == "Ouvrage") {return ouvrages;}
// }


// function returnType()
// {
// if (typeSelect.value == "Ouvrage") {return 'Point';}
// else {return 'LineString';}
// }


var modify = new ol.interaction.Modify({source: sourceO});
snap = new ol.interaction.Snap({source: sourceO}); // Implement snapping to connect lines from multiple drawing of routes/pistes



// Define actions when we click on buttons (Add,Modify,Delete)
document.getElementById('addButton').onclick = setMode;
document.getElementById('modifyButton').onclick= setMode;
document.getElementById('deleteButton').onclick= setMode;

map.on('click',createGeoJSON);

document.getElementById('saveOuvrages').onclick= function() {saveform(onsaved)};
document.getElementById('annulerOuvrages').onclick= cancelform;
document.getElementById('saveDeleteOuvrages').onclick= function() {saveform(onsaved)};
document.getElementById('annulerDeleteOuvrages').onclick= cancelform;


function addInteractions() {
    draw = new ol.interaction.Draw({
    source: sourceO,
    type: 'Point'


  });

  draw.on('drawend', function(evt){
    document.getElementById("formOuvrage").style.display = 'block';
    lastFeature = evt.feature;
  });

}


//Gestion des interactions

//Gestion des boutons add et modify
let mode = 'none';
function setMode() {

  if(this.id == 'addButton') {

    document.getElementById('modifyButton').style.color='black';
    document.getElementById('deleteButton').style.color='black';

    if(mode=='add') {
      mode = 'none';
      this.style.color='black';

  } else {
    mode = 'add';
    this.style.color='red';
    map.addInteraction(modify);
    map.addInteraction(draw);
    map.addInteraction(snap);
  }
}

else if (this.id=='modifyButton') {

  document.getElementById('addButton').style.color='black';
  document.getElementById('deleteButton').style.color='black';

  if (mode=='mod'){
    mode = 'none';
    this.style.color='black';

  } else {
    mode = 'mod';
    this.style.color='red';
  }
} else if (this.id=='deleteButton') {

  document.getElementById('addButton').style.color='black';
  document.getElementById('modifyButton').style.color='black';

  if (mode=='del') {
    mode='none';
    this.style.color='black';
  } else {
    mode = 'del';
    this.style.color='red';
  }
}


}


function createGeoJSON(evt) {

  if(mode==='add'){

      var tFeature = {
        'type' : 'Feature',
        'properties' :{
          'nameO':'',
          'typeO':'',
          'date_constructionO':'',
          'urgence_intervO':'',
          'plan_PDFO':''
        },
        'geometry':{
          'type':'Point',
          'coordinates': evt.coordinate,
        },
      };

      var reader = new ol.format.GeoJSON();
      tempFeature = reader.readFeature(tFeature);
      //tempFeature.setId('temporary')
      //ouvrages.getSource().addFeature(tempFeature);


      document.getElementById("x_coord").value = tFeature.geometry.coordinates[0];
      document.getElementById("y_coord").value = tFeature.geometry.coordinates[1];
      document.getElementById("nameO").value = tFeature.properties.nameO;
      document.getElementById("typeO").value = tFeature.properties.typeO;
      document.getElementById("date_constructionO").value = tFeature.properties.date_constructionO;
      document.getElementById("urgence_intervO").value = tFeature.properties.urgence_intervO;
      document.getElementById("plan_PDFO").value = tFeature.properties.plan_PDFO;

  }

  if(mode==='mod'){
    console.log('mode modify');
    this.forEachFeatureAtPixel(evt.pixel, function (feature,layer) {

        //console.log(feature.getProperties().date_construction);

        document.getElementById("idO").value = feature.getProperties().idO;
        document.getElementById("nameO").value = feature.getProperties().nameO;
        document.getElementById("typeO").value = feature.getProperties().typeO;
        document.getElementById("date_constructionO").value = feature.getProperties().date_constructionO;
        document.getElementById("urgence_intervO").value = feature.getProperties().urgence_intervO;
        document.getElementById("plan_PDFO").value = feature.getProperties().plan_PDFO;
        document.getElementById("x_coord").value = feature.getProperties().geometry.getCoordinates()[0];
        document.getElementById("y_coord").value = feature.getProperties().geometry.getCoordinates()[1];


        document.getElementById("formOuvrage").style.display = 'block';

        editedFeature=feature;
        return;
      
    });
  }

  if(mode == 'del') {

  this.forEachFeatureAtPixel(evt.pixel, function (feature,layer) {

    console.log('mode delete');

    //Enable feature selection
    map.addInteraction(select);

    //Get selected feature
    document.getElementById("idO").value = feature.getProperties().idO;
    //Open delete form
    document.getElementById('formDeleteOuvrages').style.display='block';

  });
}

}



function onsaved(arg,msg){
  if(arg == null){
    console.log(msg);
  }
  else{
    console.log(mode);
    if (mode=='add') {tempFeature._id=arg._id;}
    else if (mode=='mod') {

      editedFeature.setProperties({"nameO": document.getElementById("nameO").value});
      editedFeature.setProperties({"typeO": document.getElementById("typeO").value});
      editedFeature.setProperties({"date_constructionO": document.getElementById("date_constructionO").value});
      editedFeature.setProperties({"urgence_intervO": document.getElementById("urgence_intervO").value});
      editedFeature.setProperties({"plan_PDFO": document.getElementById("plan_PDFO").value});

      var geom = new ol.geom.Point([document.getElementById("x_coord").value, document.getElementById("y_coord").value ]);
      editedFeature.setGeometry(geom);
      editedFeature=null;

    }

  }
    closeForm();
}




function savedata(callback) {
  var request = window.superagent;
  var new_ouvrage = {
    type : 'Feature',
    properties : {
      nameO: document.getElementById("nameO").value,
      typeO: document.getElementById("typeO").value,
      date_constructionO: document.getElementById("date_constructionO").value,
      urgence_intervO: document.getElementById("urgence_intervO").value,
      plan_PDFO : document.getElementById("plan_PDFO").value,
    },
    geometry : {type: "point", coordinates : [
      document.getElementById("x_coord").value,
      document.getElementById("y_coord").value ]},
    };

    console.log(new_ouvrage)

   if (mode ==='add') {
    request
      .post('/form')
      .send(new_ouvrage)
      .end(function (err,res) {
        if(err) {
          return callback(null, 'Erreur de connexion au serveur, ' + err.message);
        }
        if (res.status !== 200) {
          return callback(null, res.text);
        }
        var jsonResp = JSON.parse(res.text);
        callback(jsonResp);

        });
   }

   else if (mode==='mod') {

    request
      .put('/form/updateItem')
      .send(new_ouvrage)
      .end(function (err,res) {
        if (err) {
          return callback(null, 'Erreur de connexion au serveur, ' + err.message);
        }
        if (res.status != 200) {
          return callback(null, res.text);
        };

        callback('updated');

      });
   }

   else if (mode==='del') {
    console.log('try to delete')
    request
      .delete('/form/deleteItem')
      .send(new_ouvrage)
      .end(function (err,res) {
        if (err) {
          return callback(null, 'Erreur de connexion au serveur, ' + err.message);
        }
        if (res.status != 200) {
          return callback(null, res.text);
        };
        console.log(res.text);
        callback('deleted');


      });
   }
 }


function saveform(callback) {
  savedata(callback);
}



// If we click on "Cancel" on the form
function cancelform() {

  if (mode=='add') {
    removeLastFeature();
  }
    editedFeature=null;
    onsaved(null,'cancelled');
}


//Function remove last feature called with cancelform
function removeLastFeature() {

if (lastFeature) {
  sourceO.removeFeature(lastFeature);
}

}




// function addRoutesFromDB() {
//   var request = window.superagent
//   request
//     .get('/routesfromDB')
//     .end(function(err,res) {
//       if (err) {
//         return callback(null,'Erreur de connexion au serveur, ' + err.message);
//       }
//       if (res.status !== 200) {
//         return callback(null, res.text);
//       }
//       var data = JSON.parse(res.text);
//       for(i=0; i < data.length; i++) {
//         var geojsonFeature = {
//           'type' : 'Feature',
//           'properties' :{
//             'idR': data[i]._id,
//             'nameR': data[i].nameR,
//             'origineR': data[i].origineR,
//             'finR': data[i].finR,
//             'codeR': data[i].codeR,
//             'longueurR': data[i].longueurR,
//             'classeR': data[i].classeR,
//             'typeR': data[i].typeR,
//           },
//           'geometry':{
//             'type':'LineString',
//             'coordinates': [data.forEach(d=>Math.floor(d.coordinates[0])]
//           }
//         };
//         var reader = new ol.format.GeoJSON();
//         var olFeature = reader.readFeature(geojsonFeature);
//         sourceR.addFeature(olFeature); //add to Ouvrages layer

//           }
//     });
// }



/**
 * Handle change event.
 */
// typeSelect.onchange = function() {
//   map.removeInteraction(draw); // openlayer method to remove the given interaction from the map
//   map.removeInteraction(snap);
//   addInteractions();
// };

addInteractions();



function closeFormDelete(element) {

  if (element.style.display =='block') {
          element.style.display = 'none';
  }
}


function closeForm() {
  if (document.getElementById("formOuvrage").style.display == 'block'){
            document.getElementById("formOuvrage").style.display = 'none';
  }

  // if (returnActiveLayer()==routes &&   document.getElementById("formRoute").style.display == 'block'){
  //           document.getElementById("formRoute").style.display = 'none';
  // }

  // if (returnActiveLayer()==pistes &&  document.getElementById("formPiste").style.display == 'block'){
  //           document.getElementById("formPiste").style.display = 'none';
  // }

  if (document.getElementById("formDeleteOuvrages").style.display == 'block'){
            document.getElementById("formDeleteOuvrages").style.display = 'none';
  }

}



// Funtion to display or not the geojson layers (use for limitesAdm and roadsNetwork)
function hideShow(layer) {
  if(layer.getVisible(true)) {
    layer.setVisible(false)}
else { layer.setVisible(true)}
}
