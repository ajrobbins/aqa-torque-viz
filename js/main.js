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

      // var layerSource = {
      //     type: 'torque',
      //     options: {
      //         query: "SELECT * FROM " + "data_w_geom",
      //         user_name: "ariannarobbins",
      //         cartocss: CARTOCSS
      //     }
      // };
      var layerSource = {
        user_name: 'ariannarobbins',
        type: 'cartodb',
        sublayers: [
   {
     sql: 'select * from all_day',
     cartocss: '#layer { marker-fill:#4682B4; }'
   },
   {
    sql: 'select * from data_w_geom',
    cartocss: '#layer { marker-fill: #FFB927; }'
   },
 ],
      };

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
                    layers.getSubLayer(1).show(); // cables
                    layers.getSubLayer(2).show(); // populated places
                  }
                  else if (layer == 'efg') {
                    layers.getSubLayer(0).show();
                    layers.getSubLayer(1).hide();
                    layers.getSubLayer(2).show();
                  }
                  else {
                    layers.getSubLayer(0).show();
                    layers.getSubLayer(1).show();
                    layers.getSubLayer(2).hide();
                  }
                }
              });
            }
            selectedStyle = $('li.selected').attr('id');

      cartodb.createLayer(map, layerSource, { filter: ['http', 'mapnik'] })
        .addTo(map)
        .done(function(layers) {
          createSelector(layers);

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
        })
        .error(function(err) {
            console.log("Error: " + err);
        });
