"use strict";

const API_BASE = "https://backend-circleats.onrender.com/api";
let selectedLocation = ""; // store selected coordinates

// 🔹 Initialize map + load donations on page load
window.addEventListener("load", () => {
  initMap();
  loadAvailableDonations();
});

/* ---------------- MAP SETUP ---------------- */
function initMap() {
  const map = new ol.Map({
    target: "map",
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
    view: new ol.View({
      center: ol.proj.fromLonLat([77.5946, 12.9716]), // Default center (Bangalore)
      zoom: 12,
    }),
  });

  // Allow click-to-select-location
  map.on("click", (evt) => {
    const coord = ol.proj.toLonLat(evt.coordinate);
    const [lon, lat] = coord;
    selectedLocation = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    alert("📍 Shelter location set: " + selectedLocation);
  });

  // Auto-detect live location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lon = pos.coords.longitude;
      const lat = pos.coords.latitude;
      selectedLocation = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      const coords = ol.proj.fromLonLat([lon, lat]);
      map.getView().setCenter(coords);
      map.getView().setZoom(14);

      const marker = new ol.Feature({ geometry: new ol.geom.Point(coords) });
      const markerStyle = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
          scale: 0.08,
        }),
      });
      const vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({ features: [marker] }),
        style: markerStyle,
      });
      map.addLayer(vectorLayer);
    });
  }
}

/* ---------------- LOAD AVAILABLE DONATIONS ---------------- */
async function loadAvailableDonations() {
  try {
    const res = await fetch(`${API_BASE}/donations`);
    const data = await res.json();
    const list = document.getElementById("foodList") || document.getElementById("availableDonations");
    if (!list) return;

    list.innerHTML = "";

    // 🟢 Show only pending donations
    const available = data.filter((d) => (d.status || "").toLowerCase() === "pending");
    if (!available.length) {
      list.innerHTML = "<p>No food currently available for request.</p>";
      return;
    }

    // Render each donation card
    available.forEach((d) => {
      const div = document.createElement("div");
      div.className = "food-card border-l-4 border-green-600 bg-white rounded-xl shadow p-4 mb-3";

      div.innerHTML = `
        <h3 class="text-xl font-semibold text-green-700">${d.item}</h3>
        <p><strong>Quantity:</strong> ${d.quantity}</p>
        <p><strong>Pickup Location:</strong> ${d.location}</p>
        <p><strong>Status:</strong> ${d.status}</p>
        <div class="mt-3 flex flex-wrap gap-3">
          <button 
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            onclick="requestDelivery('${d._id}', false)">
            🚚 Deliver to my shelter
          </button>
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            onclick="requestDelivery('${d._id}', true)">
            🏃 I will collect myself
          </button>
        </div>
      `;
      list.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading donations:", err);
    const list = document.getElementById("foodList") || document.getElementById("availableDonations");
    if (list) list.innerHTML = "<p class='text-red-600'>Error loading data. Please refresh.</p>";
  }
}

/* ---------------- REQUEST DELIVERY / SELF PICKUP ---------------- */
async function requestDelivery(id, selfPickup = false) {
  const email = localStorage.getItem("email");
  if (!email) {
    alert("⚠️ Please log in first!");
    return;
  }

  if (!selectedLocation && !selfPickup) {
    alert("⚠️ Please select a location on the map first!");
    return;
  }

  const payload = {
    shelter: email,
    location: selfPickup ? "Self Pickup" : selectedLocation,
    self_pickup: selfPickup,
  };

  try {
    const res = await fetch(`${API_BASE}/shelter_request/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message || "✅ Request submitted successfully!");
      loadAvailableDonations();
    } else {
      alert("⚠️ " + (data.error || "Request failed."));
    }
  } catch (err) {
    console.error("Error submitting request:", err);
    alert("❌ Server error while sending request.");
  }
}

/* ---------------- OPTIONAL: VIEW MY REQUESTS ---------------- */
async function loadMyRequests() {
  const email = localStorage.getItem("email");
  if (!email) return;

  try {
    const res = await fetch(`${API_BASE}/my_shelter_requests/${email}`);
    const data = await res.json();

    const container = document.getElementById("myRequests");
    if (!container) return;

    container.innerHTML = "";
    if (!data.length) {
      container.innerHTML = "<p>No active requests yet.</p>";
      return;
    }

    data.forEach((d) => {
      const div = document.createElement("div");
      div.className = "food-card bg-gray-50 border-l-4 border-blue-500 p-4 rounded-xl mb-3";
      div.innerHTML = `
        <h3 class="text-lg font-semibold">${d.item}</h3>
        <p>Quantity: ${d.quantity}</p>
        <p>Status: ${d.status}</p>
        <p>Delivery Mode: ${d.shelter_request.self_pickup ? "Self Pickup" : "Volunteer Delivery"}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error fetching requests:", err);
  }
}
