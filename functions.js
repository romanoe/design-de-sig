

  function initMap() {

    var limitesAdm = new ol.layer.Vector({
            source: new ol.source.Vector({
              url: 'geojson/burkina_faso_administrative.geojson',
              format: new ol.format.GeoJSON()
            }),
              style : new ol.style.Style({stroke : new ol.style.Stroke({color:"#000000",width: 1})})
          });

    var routes = new ol.layer.Vector({
              source: new ol.source.Vector({
                 url: 'geojson/burkina_faso_roads.geojson',
                 format: new ol.format.GeoJSON(),
           }),
              style : new ol.style.Style({stroke : new ol.style.Stroke({color:"#ff8c00",width: 1.7})})
         });


      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          }),

          limitesAdm,
          routes
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([-1.5338800, 12.3656600]),
          zoom: 7
        })
      });
    }

  // function toggleLayer(layerName) {
  //   if (layerName.getVisible() == true) {
  //       layerName.setVisible(false);
  //   } else {
  //       layerName.setVisible(true);
  //   }
  //}


