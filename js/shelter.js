// Initialize map
const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([78.9629, 20.5937]), // India center
    zoom: 5,
  }),
});

// Marker layer
const markerLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
});
map.addLayer(markerLayer);

// Function to add marker
function addMarker(lon, lat) {
  markerLayer.getSource().clear();
  const marker = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
  });
  const style = new ol.style.Style({
    image: new ol.style.Icon({
      src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      scale: 0.05,
    }),
  });
  marker.setStyle(style);
  markerLayer.getSource().addFeature(marker);
}

// Search & locate
document.getElementById('searchBtn').addEventListener('click', () => {
  const location = document.getElementById('locationInput').value.trim();
  if (!location) return alert('Please enter a location');

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.length === 0) {
        alert('Location not found!');
        return;
      }
      const { lon, lat } = data[0];
      addMarker(lon, lat);
      map.getView().animate({
        center: ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]),
        zoom: 14,
        duration: 1000,
      });
    })
    .catch((err) => console.error(err));
});
