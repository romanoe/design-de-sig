var source = new ol.source.Vector({});

var ouvrages = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'black'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          })
        })
      });


var limitesAdm = new ol.layer.Vector({
            source: new ol.source.Vector({
              url: '../geojson/burkina_faso_administrative.geojson',
              format: new ol.format.GeoJSON()
            })

          });

var routes = new ol.layer.Vector({
                  source: new ol.source.Vector({
                    url: '../geojson/burkina_faso_roads.geojson',
                    format: new ol.format.GeoJSON()
                  }),
                  style: new ol.style.Style({
                    stroke: new ol.style.Stroke({color: 'red', width: 2})
                  })
                });

var map = new ol.Map({
        target: 'map',
        layers: [new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
          ouvrages,limitesAdm,routes],

        view: new ol.View({
          center: ol.proj.fromLonLat([-1.5338800, 12.3656600]),
          zoom: 7
        })
      });


      var modify = new ol.interaction.Modify({source: source});
            map.addInteraction(modify);

            var draw, snap; // global so we can remove them later
            var typeSelect = document.getElementById('type');

            function addInteractions() {
              draw = new ol.interaction.Draw({
                source: source,
                type: (typeSelect.value)
              });
              map.addInteraction(draw);
              snap = new ol.interaction.Snap({source: source});
              map.addInteraction(snap);

            }

            /**
             * Handle change event.
             */
            typeSelect.onchange = function() {
              map.removeInteraction(draw);
              map.removeInteraction(snap);
              addInteractions();
            };

            addInteractions();



            function hideShow(layer) {

            if(layer.getVisible(true)) {

            layer.setVisible(false)} else { layer.setVisible(true)}

            }
