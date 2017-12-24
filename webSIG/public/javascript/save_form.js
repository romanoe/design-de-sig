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
      id: document.getElementById("id").value,
      nameO: document.getElementById("nameO").value,
      typeO: document.getElementById("typeO").value,
      date_constructionO: document.getElementById("date_constructionO").value,
      urgence_intervO: document.getElementById("urgence_intervO").value,
      plan_PDFO : document.getElementById("plan_PDFO").value,
    },
    geometry : {type: "Point", coordinates : [
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
        console.log(res.text);

        callback('updated');

      });
   }

   else if (mode==='del') {
    console.log('try to delete')
    console.log(new_ouvrage);
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