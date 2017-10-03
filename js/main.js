var CARTOCSS = [
          'Map {',
          '-torque-time-attribute: "cartodb_id";',
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

      // var torqueLayer = new L.TorqueLayer({
      //   user       : 'arobbins',
      //   table      : 'all_day',
      //   cartocss: CARTOCSS
      // });
      // torqueLayer.addTo(map);
      // torqueLayer.play();

      var layerSource = {
          type: 'torque',
          options: {
              query: "SELECT * FROM " + "all_day",
              user_name: "arobbins",
              cartocss: CARTOCSS
          }
      };

      cartodb.createLayer(map, layerSource)
        .addTo(map)
        .done(function(layer) {
            var torqueLayer = layer;
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

        })
        .error(function(err) {
            console.log("Error: " + err);
        });
