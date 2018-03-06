function main() {
var CARTOCSS = [
          'Map {',
          '-torque-time-attribute: "date";',
          '-torque-aggregation-function: "count(1)";',
          '-torque-frame-count: 256;',
          '-torque-animation-duration: 30;',
          '-torque-data-aggregation: linear;',
          '-torque-resolution: 4',
          '}',
          '#layer {',
          '  marker-width: 7;',
          '  marker-fill-opacity: 0.9;',
          '  marker-fill: #FFB927; ',
          '  comp-op: "lighter";',
          '  marker-line-width: 1;',
          '  marker-line-color: #FFF;',
          '  marker-line-opacity: 1;',
          '  [frame-offset = 1] { marker-width: 9; marker-fill-opacity: 0.45;}',
          '  [frame-offset = 2] { marker-width: 11; marker-fill-opacity: 0.225;}',
          '}'
      ].join('\n');


      var map = new L.Map('map', {
        zoomControl: true,
        center: [40, 0],
        zoom: 3
      });

      L.tileLayer('http://{s}.api.cartocdn.com/base-dark/{z}/{x}/{y}.png', {
        attribution: 'CartoDB'
      }).addTo(map);

      var torqueLayerSource = {
          type: 'torque',
          options: {
              query: "SELECT * FROM " + "data_w_geom",
              user_name: "ariannarobbins",
              cartocss: CARTOCSS
          }
      };

      var otherLayerSource = {
          user_name: "ariannarobbins",
          type: "cartodb",
          sublayers: [{
           sql: 'select * from all_day',
           cartocss: '#geom_data_js_v2 {marker-fill: #ff7800; }',
          }]
      };

      var selectedLayer;
            // create layer selector
            function createSelector(layers) {
              var $options = $('#layer_selector li');
              $options.click(function(e) {
                var $li = $(e.target);
                var layer = $li.attr('id');
                if(selectedLayer != layer ){

                  if (layer == 'abc'){
                    layers.getSubLayer(0).show(); // countries
                    layers.getSubLayer(1).hide(); // cables
                  }
                  else if (layer == 'efg') {
                    layers.getSubLayer(0).hide();
                    layers.getSubLayer(1).show();
                  }
                  else {
                    layers.getSubLayer(0).show();
                    layers.getSubLayer(1).show();
                  }
                }
              });
            }
            selectedStyle = $('li.selected').attr('id');

            function torqueLayerCallBack(torqueLayer) {
              torqueLayer.pause();

              torqueLayer.on('load', function() {
                  torqueLayer.play();
              });

              // pause animation at last frame
              torqueLayer.on('change:time', function(changes) {
                  if (changes.step === torqueLayer.provider.getSteps() - 1) {
                      torqueLayer.pause();
                  }
              });

                $('#target-button').click(function() {
                  console.log("targeting on");
                  torqueLayer.hide();
                  torqueLayer.stop();
                  $('.cartodb-timeslider').hide();
                });


                $('#reset-button').click(function() {
                  console.log("reset!");
                  torqueLayer.show();
                  torqueLayer.play();
                  $('.cartodb-timeslider').show();
                });
            }
            cartodb.createLayer(map, torqueLayerSource)
              .addTo(map)
              .done(function(torqueLayer) {
                torqueLayer.pause();
                torqueLayer.on('load', function() {
                  torqueLayer.play();
                });

                torqueLayer.on('change:time', function(changes) {
                  if (changes.step === torqueLayer.provider.getSteps() - 1) {
                    torqueLayer.pause();
                  }
                });

                cartodb.createLayer(map, otherLayerSource)
                  .addTo(map)
                  .done(function() {
                    createSelector(map.getLayers()); //get layers from map (map object) and pass to selector
                  });
              });
}
window.onload=main;
