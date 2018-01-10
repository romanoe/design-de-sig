var draw, snap; // global so we can remove them later

var modify = new ol.interaction.Modify({source: sourceO});
snap = new ol.interaction.Snap({source: sourceO}); // Implement snapping to connect lines from multiple drawing of routes/pistes
draw = new ol.interaction.Draw({source: sourceO,type: 'Point'});
var selectInteraction = new ol.interaction.Select({
    condition: ol.events.condition.singleClick,
})
var selectedFeatureID;
var tempFeature;
var lastFeature;
//map.addInteraction(selectInteraction);

//selectInteraction.on("select", deleteFeature, this);

// Define actions when we click on buttons (Add,Modify,Delete). Function setMode
document.getElementById('addButton').onclick = setMode;
document.getElementById('modifyButton').onclick= setMode;
document.getElementById('deleteButton').onclick= setMode;

map.on('click',createGeoJSON);

//Button save, cancel functions
document.getElementById('saveOuvrages').onclick= function() {saveform(onsaved)};
document.getElementById('annulerOuvrages').onclick= cancelform;
document.getElementById('saveDeleteOuvrages').onclick= function() {saveform(onsaved)};
document.getElementById('annulerDeleteOuvrages').onclick= cancelform;



//Gestion des boutons add,modify and delete
let mode = 'none';
function setMode() {

  if(this.id == 'addButton') {

    document.getElementById('modifyButton').style.color='black';
    document.getElementById('deleteButton').style.color='black';

    if(mode=='add') {
      mode = 'none';
      this.style.color='black';
      map.removeInteraction(draw);

  } else {
    mode = 'add';
    this.style.color='red';

    map.addInteraction(draw);
    map.addInteraction(snap);
    draw.on('drawend', function(evt){
      document.getElementById("formOuvrage").style.display = 'block';
      lastFeature = evt.feature;
    });

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
    //Remove previous interactions
    map.removeInteraction(draw);
    map.addInteraction(modify);
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
    //Remove previous interactions
    map.removeInteraction(draw);
    map.removeInteraction(modify);


    this.style.color='red';
  }
}


}

//Function createGeoJSON -
function createGeoJSON(evt) {

  if(mode==='add'){

      var tFeature = {
        'type' : 'Feature',
        'properties' :{
          'id':'',
          'nameO':'',
          'typeO':'',
          'date_constructionO':'',
          'urgence_intervO':'',
          'plan_PDFO':'',
        },
        'geometry':{
          'type':'Point',
          'coordinates': evt.coordinate,
        },
      };

      var reader = new ol.format.GeoJSON();
      tempFeature = reader.readFeature(tFeature);

      document.getElementById("x_coord").value = tFeature.geometry.coordinates[0];
      document.getElementById("y_coord").value = tFeature.geometry.coordinates[1];
      document.getElementById("nameO").value = tFeature.properties.nameO;
      document.getElementById("typeO").value = tFeature.properties.typeO;
      document.getElementById("date_constructionO").value = tFeature.properties.date_constructionO;
      document.getElementById("urgence_intervO").value = tFeature.properties.urgence_intervO;
      document.getElementById("plan_PDFO").value = tFeature.properties.plan_PDFO;

  }

  if(mode==='mod'){
    //console.log('mode modify');
    this.forEachFeatureAtPixel(evt.pixel, function (feature,layer) {

        document.getElementById("id").value = feature.getProperties().id;
        //console.log(feature.getProperties().nameO);
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

    //console.log('mode delete');
    map.addInteraction(selectInteraction);
    //Get selected feature id
    document.getElementById("idDel").value = feature.getProperties().id;
    //Open delete form
    document.getElementById('formDeleteOuvrages').style.display='block';

  });
}

}


// If we click on "Cancel" on the form. And remove last feature because it has not been saved
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


//Close form, called when we save the data and cancel our action
function closeForm() {
  if (document.getElementById("formOuvrage").style.display == 'block'){
            document.getElementById("formOuvrage").style.display = 'none';
  }

  else if (document.getElementById("formDeleteOuvrages").style.display == 'block'){
            document.getElementById("formDeleteOuvrages").style.display = 'none';
  }

}



// Funtion to display or not the geojson layers (use for limitesAdm, routes and pistes)
function hideShow(layer) {
  if(layer.getVisible(true)) {
    layer.setVisible(false);}
else { layer.setVisible(true)}
}
