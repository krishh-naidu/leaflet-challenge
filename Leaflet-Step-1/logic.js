//  Store our API endpoint inside queryUrl
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var faultLines = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
// Perform a GET request to the query URL
d3.json(url, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    // console.log(data);
    createFeatures(data.features);
  });
  function markerColor(mag) {

    if (mag <= 4.75) {
        return "#1635D9";
    } else if (4.75 < mag & mag <= 5.00) {
        return "#13DECE";
    } else if (5.00 < mag & mag <= 5.25) {
        return "#12E510";
    } else if (5.25 < mag & mag <= 5.50) {
        return "#DCEB0C";
    } else {
        return "#F02908";
    };
  }


  function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"+
        "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
        
          var geojsonMarkerOptions = {
            radius: 2*feature.properties.mag,
            fillColor: markerColor(feature.properties.mag),
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          };
          return L.circleMarker(latlng, geojsonMarkerOptions);
        }
      });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {
    // Various Map Layers (Mapbox API) for user selection
    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY2ZlcnJhcmVuIiwiYSI6ImNqaHhvcW9sNjBlMmwzcHBkYzk0YXRsZ2cifQ.lzNNrQqp-E85khEiWhgq4Q");
    var grayScale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY2ZlcnJhcmVuIiwiYSI6ImNqaHhvcW9sNjBlMmwzcHBkYzk0YXRsZ2cifQ.lzNNrQqp-E85khEiWhgq4Q");
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiY2ZlcnJhcmVuIiwiYSI6ImNqaHhvcW9sNjBlMmwzcHBkYzk0YXRsZ2cifQ.lzNNrQqp-E85khEiWhgq4Q");
  
  
    // BaseMaps that users can select
    var baseMaps = {
      "Satellite Map": satelliteMap,
      "Outdoor Map": outdoors,
      "Gray Scale": grayScale
    };
  
    // Add a tectonic plate layer
    var faultLines =new L.LayerGroup();
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      Faultlines: faultLines
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [41.881832, -87.62317],
      zoom: 2,
      layers: [satelliteMap, grayScale, outdoors]
    
    });
  
     // Add Fault lines data
     d3.json(faultLines, function(earthquakeData) {
       // Adding our geoJSON data, along with style information, to the tectonicplates
       // layer.
       L.geoJson(earthquakeData, {
         color: "orange",
         weight: 3
       })
       .addTo(faultLines);
     });
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
    legend: true
  }).addTo(myMap);
  
  // Create legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = () => {
    var div = L.DomUtil.create('div', 'info legend');
    var magnitudes = [4.75, 5.0, 5.25, 5.5, 5.75];

    magnitudes.forEach(m => {
      var range = `${m} - ${m+0.25}`;
      if (m >= 5.75) {range = `${m}+`}
      var html = `<div class="legend-item">
            <div style="height: 25px; width: 25px; background-color:${markerColor(m)}"> </div>
            <div class=legend-text>Magnitude:- <strong>${range}</strong></div>
        </div>`
      div.innerHTML += html
    });
    return div;
  };
  legend.addTo(myMap);
  }