var CARTOCSS = [
          'Map {',
          '-torque-time-attribute: "date";',
          '-torque-aggregation-function: "count(1)";',
          '-torque-frame-count: 1;',
          '-torque-animation-duration: 0;',
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
          options: {
            sql: "SELECT * FROM all_day",
            cartocss: '#layer { marker-fill: #FFB927; }'
          }
      };
//       var layerSource = {
//         user_name: 'ariannarobbins',
//         type: 'cartodb',
//         sublayers: [
//    {
//     sql: 'select * from all_day',
//     cartocss: '#layer { marker-fill: #FFB927; }'
//    },
//    {
//   // type: 'torque', // Required
//   options: {
//     query: "SELECT * FROM " + "data_w_geom",   // Required if table_name is not given
//     user_name: "ariannarobbins", // Required
//     cartocss: CARTOCSS // Required
//   }
// }
//  ],
//       };

      var selectedLayer;
            // create layer selector
            function createSelector(layers) {
              var sql = new cartodb.SQL({ user: 'examples' });

              var $options = $('#layer_selector li');
              $options.click(function(e) {
                // get the area of the selected layer
                var $li = $(e.target);
                var layer = $li.attr('id');
                if(selectedLayer != layer ){
                  // definitely more elegant ways to do this, but went for
                  // ease of understanding
                  if (layer == 'abc'){
                    layers.getSubLayer(0).show(); // countries
                    layers.getSubLayer(1).hide(); // cables
                    // layers.getSubLayer(2).show(); // populated places
                  }
                  else if (layer == 'efg') {
                    layers.getSubLayer(0).hide();
                    layers.getSubLayer(1).show();
                    // layers.getSubLayer(2).show();
                    // var torqueLayer = layer;
                    // torqueLayer.pause();
                    //
                    // torqueLayer.on('load', function() {
                    //     torqueLayer.play();
                    // });
                    //
                    // // pause animation at last frame
                    // torqueLayer.on('change:time', function(changes) {
                    //     if (changes.step === torqueLayer.provider.getSteps() - 1) {
                    //         torqueLayer.pause();
                    //     }
                    // });
                  }
                  else {
                    layers.getSubLayer(0).show();
                    layers.getSubLayer(1).show();
                    // layers.getSubLayer(2).hide();
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
                  // layer.getSubLayer(0).setSQL('SELECT * FROM geom_data_js_v2 WHERE wtarg = 1');
                });


                $('#reset-button').click(function() {
                  console.log("reset!");
                  torqueLayer.show();
                  torqueLayer.play();
                  $('.cartodb-timeslider').show();
                  // layer.getSubLayer(0).setSQL('SELECT * FROM geom_data_js_v2 WHERE wtarg = 1');
                });
            }

            var q = queue(3);
            q.defer(function(torqueLayerSource, torqueLayerCallBack) {
                cartodb.createLayer(map, torqueLayerSource, function(layer) { torqueLayerCallBack( layer); });
            });
            q.defer(function(otherLayerSource) {
            cartodb.createLayer(map, otherLayerSource);
            });

            q.await(function() {
                      var layers = Array.prototype.slice.call(arguments, 1);
                      createSelector(layers);
                      layers.forEach(function(layer) {
                        layer.addTo(map);
                      });
                    });
      // cartodb.createLayer(map, layerSource)
      //   .addTo(map)
      //   .done(function(layers) {
      //     createSelector(layers);
      //
      //     var torqueLayer = layers[1];
      //     torqueLayer.pause();
      //
      //     torqueLayer.on('load', function() {
      //         torqueLayer.play();
      //     });
      //
      //     // pause animation at last frame
      //     torqueLayer.on('change:time', function(changes) {
      //         if (changes.step === torqueLayer.provider.getSteps() - 1) {
      //             torqueLayer.pause();
      //         }
      //     });
      //
      //       $('#target-button').click(function() {
      //         console.log("targeting on");
      //         torqueLayer.hide();
      //         torqueLayer.stop();
      //         $('.cartodb-timeslider').hide();
      //         // layer.getSubLayer(0).setSQL('SELECT * FROM geom_data_js_v2 WHERE wtarg = 1');
      //       });
      //
      //
      //       $('#reset-button').click(function() {
      //         console.log("reset!");
      //         torqueLayer.show();
      //         torqueLayer.play();
      //         $('.cartodb-timeslider').show();
      //         // layer.getSubLayer(0).setSQL('SELECT * FROM geom_data_js_v2 WHERE wtarg = 1');
      //       });
      //   })
      //   .error(function(err) {
      //       console.log("Error: " + err);
      //   });
