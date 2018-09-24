window.onload = function() {
  var CARTOCSS = [
    "Map {",
    '-torque-time-attribute: "date";',
    '-torque-aggregation-function: "count(1)";',
    "-torque-frame-count: 256;",
    "-torque-animation-duration: 30;",
    "-torque-data-aggregation: linear;",
    "-torque-resolution: 4",
    "}",
    "#layer {",
    "  marker-width: 7;",
    "  marker-fill-opacity: 0.9;",
    "  marker-fill: #FFB927; ",
    '  comp-op: "lighter";',
    "  marker-line-width: 1;",
    "  marker-line-color: #FFF;",
    "  marker-line-opacity: 1;",
    "  [frame-offset = 1] { marker-width: 9; marker-fill-opacity: 0.45;}",
    "  [frame-offset = 2] { marker-width: 11; marker-fill-opacity: 0.225;}",
    "}"
  ].join("\n");

  var map = new L.Map("map", {
    zoomControl: true,
    center: [40, 0],
    zoom: 3
  });

  L.tileLayer("https://{s}.api.cartocdn.com/base-dark/{z}/{x}/{y}.png", {
    attribution: "CartoDB"
  }).addTo(map);

  var torqueLayerSource = {
    type: "torque",
    options: {
      query: "SELECT * FROM " + "data_w_geom",
      user_name: "ariannarobbins",
      cartocss: CARTOCSS
    }
  };

  var INITIAL_SELECTED_SUBLAYER = 0;
  var otherLayerSource = {
    user_name: "ariannarobbins",
    type: "cartodb",
    sublayers: [
      {
        sql: "SELECT * FROM data_w_geom",
        cartocss:
          "#data_w_geom [atac <-0.29]{marker-fill: #26cad6;} #data_w_geom [atac>-0.29] {marker-fill: #efe00b}", //teal-yellow, Tactics
        interactivity: ["imonth", "iday", "iyear", "summary", "gname"]
      },
      {
        sql: "SELECT * FROM data_w_geom",
        cartocss:
          "#data_w_geom [atarg<0.03]{marker-fill: #7a1168;} #data_w_geom [atarg>0.03] {marker-fill: #abca0c;}", //purple-green, Targeting
        interactivity: ["imonth", "iday", "iyear", "summary", "gname"]
      }
    ]
  };

  var densityLegend = new cdb.geo.ui.Legend.Density({
    title: "Tactics",
    left: "Kidnap",
    right: "Suicide",
    colors: [
      "#26cad6",
      "#efe00b"
    ]
  });
  $("#map").append(densityLegend.render().el);
  // Hide the legend for Violent crimes by default
  $(densityLegend.render().el).hide();

  var densityLegendNon = new cdb.geo.ui.Legend.Density({
    title: "Targeting",
    left: "State",
    right: "West",
    colors: [
      "#7a1168",
      "#abca0c"
    ]
  });
  $("#map").append(densityLegendNon.render().el);

  cartodb
    .createLayer(map, torqueLayerSource, { https: true })
    .addTo(map)
    .done(function(torqueLayer) {
      torqueLayer.pause();
      torqueLayer.on("load", function() {
        torqueLayer.play();
      });

      //pause animation at last frame
      torqueLayer.on("change:time", function(changes) {
        if (changes.step === torqueLayer.provider.getSteps() - 1) {
          torqueLayer.pause();
        }
      });

      $("#target-button").click(function() {
        console.log("targeting on");
        torqueLayer.hide();
        torqueLayer.stop();
        $(".cartodb-timeslider").hide();
      });

      $("#reset-button").click(function() {
        console.log("reset!");
        torqueLayer.show();
        torqueLayer.play();
        $(".cartodb-timeslider").show();
      });
    });

  function selectInitialSublayer(layer) {
    var isInitialViolent = $("ul")
      .find("[data-sublayerIdx='" + INITIAL_SELECTED_SUBLAYER + "']")
      .hasClass("vio");
    selectSublayer(layer, INITIAL_SELECTED_SUBLAYER, isInitialViolent);
  }

  function selectSublayer(layer, selectedSublayer, violent) {
    for (var i = 0; i < layer.getSubLayerCount(); i++) {
      var sublayer = layer.getSubLayer(i);
      if (i === selectedSublayer) {
        sublayer.show();
        // add popup
        cdb.vis.Vis.addInfowindow(map, sublayer, ["imonth", "iday", "iyear", "summary", "gname"], {
          infowindowTemplate: $("#infowindow_template").html()
        });
      } else {
        sublayer.hide();
      }
    }
    if (violent) {
      $(densityLegendNon.render().el).hide();
      $(densityLegend.render().el).show();
      console.log("violent");
    } else {
      $(densityLegend.render().el).hide();
      $(densityLegendNon.render().el).show();
    }

    $("ul")
      .find("[data-sublayerIdx='" + selectedSublayer + "']")
      .addClass("font-weight-bold");

    $("ul")
      .find("[data-sublayerIdx!='" + selectedSublayer + "']")
      .removeClass("font-weight-bold");
  }

  cartodb
    .createLayer(map, otherLayerSource, { https: true })
    .addTo(map)
    .done(function(layer) {
      selectInitialSublayer(layer);

      function handleLayerSelectorClick(e) {
        var selectedSublayer = Number($(e.target).attr("data-sublayerIdx"));
        var isViolent = $(e.target).hasClass("vio");
        selectSublayer(layer, selectedSublayer, isViolent);
      }

      $("li").on("click", handleLayerSelectorClick);
    });
};
