// Initialize OpenLayers map
window.addEventListener("load", () => {
  const map = new ol.Map({
    target: "map",
    layers: [
      new ol.layer.Tile({ source: new ol.source.OSM() })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([77.5946, 12.9716]), // Default: Bangalore
      zoom: 13
    })
  });

  // Get volunteer location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lon = pos.coords.longitude;
        const lat = pos.coords.latitude;
        const coords = ol.proj.fromLonLat([lon, lat]);

        map.getView().setCenter(coords);
        map.getView().setZoom(15);

        // Add volunteer marker
        const volunteerMarker = new ol.Feature({
          geometry: new ol.geom.Point(coords)
        });

        const vectorSource = new ol.source.Vector({
          features: [volunteerMarker]
        });

        const markerStyle = new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
            scale: 0.08
          })
        });

        const vectorLayer = new ol.layer.Vector({
          source: vectorSource,
          style: markerStyle
        });

        map.addLayer(vectorLayer);
      },
      (err) => console.warn("Geolocation error:", err.message)
    );
  }
});

// Donor data
const donorData = {
  pasta: {
    name: "Anna’s Kitchen",
    contact: "+91 9876543210",
    address: "Koramangala, Bangalore",
    food: "Pasta Trays",
    quantity: "8 Trays",
    notes: "Packed fresh today."
  },
  salad: {
    name: "Green Leaf Café",
    contact: "+91 9123456789",
    address: "Indiranagar, Bangalore",
    food: "Veg Salad Boxes",
    quantity: "10 Boxes",
    notes: "Contains dressing separately."
  },
  bread: {
    name: "Daily Bread Bakery",
    contact: "+91 9988776655",
    address: "Jayanagar, Bangalore",
    food: "Bread Loaves",
    quantity: "15 Loaves",
    notes: "Freshly baked, expiring tomorrow."
  }
};

// Show modal with donor details
function showDonorDetails(itemKey) {
  const donor = donorData[itemKey];
  const modal = document.getElementById("donorModal");
  const info = document.getElementById("donorInfo");

  if (donor) {
    info.innerHTML = `
      <strong>Donor Name:</strong> ${donor.name}<br>
      <strong>Contact:</strong> ${donor.contact}<br>
      <strong>Address:</strong> ${donor.address}<br>
      <strong>Food Type:</strong> ${donor.food}<br>
      <strong>Quantity:</strong> ${donor.quantity}<br>
      <strong>Notes:</strong> ${donor.notes}
    `;
    modal.style.display = "block";
  }
}

// Close modal
function closeModal() {
  document.getElementById("donorModal").style.display = "none";
}

// Close modal when clicking outside
window.onclick = (event) => {
  const modal = document.getElementById("donorModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
