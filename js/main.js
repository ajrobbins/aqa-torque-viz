window.onload = function () {
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
    sublayers: [
      {
        sql: "SELECT * FROM data_w_geom",
        cartocss: '#data_w_geom [atac <-0.29]{marker-fill: #26cad6;} #data_w_geom [atac>-0.29] {marker-fill: #efe00b}', //teal-yellow, Tactics
        interactivity: "eventid",
      },
      {
        sql: "SELECT * FROM data_w_geom",
        cartocss: '#data_w_geom [atarg<0.03]{marker-fill: #7a1168;} #data_w_geom [atarg>0.03] {marker-fill: #abca0c;}', //purple-green, Targeting
        interactivity: "eventid",
      },
    ]
  };


            // Create layer selector
  function createSelector(layer,num,violent,torque) {
   for (var i = 0; i < layer.getSubLayerCount(); i++) {
    if (i === num) {
      layer.getSubLayer(i).show();
    } else {
      layer.getSubLayer(i).hide();
    }
   }
   if (violent){
      $(densityLegendNon.render().el).hide();
      $(densityLegend.render().el).show();
      console.log("violent");
   }
   else {
      $(densityLegend.render().el).hide();
      $(densityLegendNon.render().el).show();
   }
  }


  selectedStyle = $('li.selected').attr('data');

  var densityLegend = new cdb.geo.ui.Legend.Density({
		title:   "Tactics",
  	left: "Low", right: "High", colors: [ "#26cad6", "#FED976", "#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#efe00b"  ]
  });
  $('#map').append(densityLegend.render().el);
  // Hide the legend for Violent crimes by default
  $(densityLegend.render().el).hide();

  var densityLegendNon = new cdb.geo.ui.Legend.Density({
      title: "Targeting",
      left: "Low", right: "High", colors: [ "#7a1168", "#C7E9B4", "#7FCDBB", "#41B6C4", "#1D91C0", "#225EA8", "#abca0c" ]
  });
  $('#map').append(densityLegendNon.render().el);

  cartodb.createLayer(map, torqueLayerSource)
    .addTo(map)
    .done(function(torqueLayer) {
      torqueLayer.pause();
      torqueLayer.on('load', function() {
        torqueLayer.play();
      });

      //pause animation at last frame
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
      });
    cartodb.createLayer(map, otherLayerSource)
    .addTo(map)
    .done(function(layer) {
      $("li").on('click', function(e) {
        var num = +$(e.target).attr('Data');
        console.log(num);
        createSelector(layer,num,$(e.target).hasClass('vio'));
        });
      }
      );
};
