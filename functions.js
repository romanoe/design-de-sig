

  function initMap() {
    var limitesAdm = new ol.layer.Vector({
            source: new ol.source.Vector({
              url: 'geojson/burkina_faso_administrative.geojson',
              format: new ol.format.GeoJSON()
            })
          });

        var routes = new ol.layer.Vector({
                  source: new ol.source.Vector({
                    url: 'geojson/burkina_faso_roads.geojson',
                    format: new ol.format.GeoJSON(),
                  })
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
