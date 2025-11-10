"use strict";

const API_BASE = "https://backend-circleats.onrender.com/api";
let shelterLocation = ""; // Store selected coordinates

window.addEventListener("load", () => {
  initMap();
  loadCollectedFood();
});

/* ---------- Initialize Map ---------- */
function initMap() {
  const map = new ol.Map({
    target: "map",
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
    view: new ol.View({
      center: ol.proj.fromLonLat([77.5946, 12.9716]), // Default center (Bangalore)
      zoom: 12,
    }),
  });

  // 📍 Set marker when shelter clicks map
  map.on("click", async (evt) => {
    const coord = ol.proj.toLonLat(evt.coordinate);
    const [lon, lat] = coord;
    shelterLocation = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    alert("✅ Shelter location selected: " + shelterLocation);
  });

  // Show shelter's current geolocation (optional)
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lon = pos.coords.longitude;
      const lat = pos.coords.latitude;
      const coords = ol.proj.fromLonLat([lon, lat]);
      map.getView().setCenter(coords);
      map.getView().setZoom(14);

      const marker = new ol.Feature({
        geometry: new ol.geom.Point(coords),
      });
      const vectorSource = new ol.source.Vector({ features: [marker] });
      const markerStyle = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
          scale: 0.08,
        }),
      });
      const vectorLayer = new ol.layer.Vector({ source: vectorSource, style: markerStyle });
      map.addLayer(vectorLayer);
    });
  }
}

/* ---------- Load Collected Food ---------- */
async function loadCollectedFood() {
  try {
    const res = await fetch(`${API_BASE}/donations`);
    const data = await res.json();
    const list = document.getElementById("foodList");
    list.innerHTML = "";

    // Show only donations with status "Collected"
    const ready = data.filter((d) => d.status === "Collected");
    if (!ready.length) {
      list.innerHTML = "<p>No food currently ready for donation.</p>";
      return;
    }

    ready.forEach((d) => {
      const div = document.createElement("div");
      div.className = "food-card";
      div.innerHTML = `
        <h3 class="text-xl font-semibold text-green-700">${d.item}</h3>
        <p><strong>Quantity:</strong> ${d.quantity}</p>
        <p><strong>Pickup Location:</strong> ${d.location}</p>
        <p><strong>Volunteer:</strong> ${d.collected_by || "Pending"}</p>
        <button onclick="acceptFood('${d._id}')" class="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          ✅ Accept This Food
        </button>
      `;
      list.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading donations:", err);
    document.getElementById("foodList").innerHTML =
      "<p class='text-red-600'>Error loading data. Please refresh.</p>";
  }
}

/* ---------- Accept Food ---------- */
async function acceptFood(id) {
  const shelter = localStorage.getItem("email");
  if (!shelter) {
    alert("⚠️ Please log in as a shelter before accepting food!");
    return;
  }

  if (!shelterLocation) {
    alert("⚠️ Please click on the map to select your shelter location first!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/shelter_accept/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shelter,
        location: shelterLocation,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("🎉 Food successfully accepted for delivery!");
      loadCollectedFood(); // Refresh updated list
    } else {
      alert("⚠️ " + (data.error || "Could not accept this food."));
    }
  } catch (err) {
    console.error("Error accepting food:", err);
    alert("❌ Server error while processing the request.");
  }
}
