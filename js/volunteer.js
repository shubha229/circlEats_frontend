"use strict";

// 🌍 Backend API base URL
const API_BASE = "https://backend-circleats.onrender.com/api";

window.addEventListener("load", () => {
  const map = new ol.Map({
    target: "map",
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
    view: new ol.View({
      center: ol.proj.fromLonLat([77.5946, 12.9716]),
      zoom: 13,
    }),
  });

  // Volunteer location marker
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lon = pos.coords.longitude;
      const lat = pos.coords.latitude;
      const coords = ol.proj.fromLonLat([lon, lat]);

      map.getView().setCenter(coords);
      map.getView().setZoom(15);

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
});

// ---------- Volunteer logic ----------
async function loadDonations() {
  try {
    const res = await fetch(`${API_BASE}/donations`);
    const data = await res.json();
    const list = document.getElementById("donationList");
    list.innerHTML = "";

    data.filter(d => d.status === "Pending").forEach(d => {
      const div = document.createElement("div");
      div.className = "donation-card";
      div.innerHTML = `
        <h3>${d.item}</h3>
        <p>Quantity: ${d.quantity}</p>
        <p>Location: ${d.location}</p>
        <button onclick="acceptDonation('${d._id}')">Accept Delivery</button>
      `;
      list.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading donations:", err);
  }
}

async function acceptDonation(id) {
  const volunteer = localStorage.getItem("email");
  const res = await fetch(`${API_BASE}/collect_donation/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ volunteer }),
  });
  const data = await res.json();
  alert(data.message);
  loadDonations();
}

window.onload = loadDonations;

