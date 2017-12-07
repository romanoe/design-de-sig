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
              url: '/mapjson/burkina_faso_administrative',
              format: new ol.format.GeoJSON(),
              projection: 'EPSG : 4326'
            })

          });

// Roads network overlay
var roadsNetwork = new ol.layer.Vector({
                  source: new ol.source.Vector({
                    url: '/mapjson/burkina_faso_roads',
                    format: new ol.format.GeoJSON(),
                    projection: 'EPSG : 4326'
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
snap = new ol.interaction.Snap({source: returnActiveLayer().getSource()}); // Implement snapping to connect lines from multiple drawing of routes/pistes



// Define actions when we click on buttons (Add,Modify,Delete)
document.getElementById('addButton').onclick = setMode;
document.getElementById('modifyButton').onclick= setMode;
map.on('click',createGeoJSON);

document.getElementById('saveOuvrages').onclick= function() {saveform(onsaved)};
document.getElementById('annulerOuvrages').onclick= cancelform;


function addInteractions() {
    draw = new ol.interaction.Draw({
    source: returnActiveLayer().getSource(),
    type: returnType()
  });


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


//Gestion des boutons add et modify
let mode = 'none';
function setMode() {

  if(this.id == 'addButton') {
    document.getElementById('modifyButton').style.color='black';

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
  if (mode=='mod'){
    mode = 'none';
    this.style.color='black';

  } else {
    mode = 'mod';
    this.style.color='red';
  }
}


}



var tempFeature;

function createGeoJSON(evt) {

  if(mode==='add'){

      var tFeature = {
        'type' : 'Feature',
        'properties' :{
          'name':'',
          'type':'',
          'date_construction':'',
          'urgence_interv':'',
          'plan_PDF':''
        },
        'geometry':{
          'type':'Point',
          'coordinates': evt.coordinate
        }
      }

      var reader = new ol.format.GeoJSON();
      tempFeature = reader.readFeature(tFeature);
      sourceO.addFeature(tempFeature);

      document.getElementById("x_coord").value = tFeature.geometry.coordinates[0];
      document.getElementById("y_coord").value = tFeature.geometry.coordinates[1];
      document.getElementById("name").value = tFeature.properties.name;
      document.getElementById("type").value = tFeature.properties.type;
      document.getElementById("date_construction").value = tFeature.properties.date_construction;
      document.getElementById("urgence_interv").value = tFeature.properties.urgence_interv;
      document.getElementById("plan_PDF").value = tFeature.properties.plan_PDF;

  }
}




function onsaved(arg,msg){
  if(arg == null){
    console.log(msg);
  }
  else{
    if (mode=='add') {tempFeature._id=arg._id;}
  }
    closeForm();
}




function savedata(callback) {
  var request = window.superagent;
  console.log(request);
  var ouvragesE = {
    name: document.getElementById("name").value,
    type: document.getElementById("type").value,
    date_construction: document.getElementById("date_construction").value,
    urgence_interv: document.getElementById("urgence_interv").value,
    plan_PDF : document.getElementById("plan_PDF").value,
    geometry : {type: "point", coordinates : [
      document.getElementById("x_coord").value,
      document.getElementById("y_coord").value ]},
    };
    console.log(ouvragesE)

   if (mode ==='add') {
    request
      .post('/form')
      .send(ouvragesE)
      .end(function(err,res) {
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
 }

function saveform(callback) {
  savedata(callback);
}




// If we click on "Cancel" on the form
function cancelform() {
  if (mode=='add') {
    sourceO.removeFeature(tempFeature); // remove the temporary feature drawned
    console.log('nice')
  };
    sourceO.clear()
    onsaved(null,'cancelled');
}




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
  if (document.getElementById("formOuvrage").style.display == 'block'){
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


