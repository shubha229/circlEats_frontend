"use strict";

const API_BASE = "https://backend-circleats.onrender.com/api";

window.addEventListener("DOMContentLoaded", () => {
  const volunteerEmail = localStorage.getItem("email");
  if (!volunteerEmail) {
    alert("Please log in as a volunteer first!");
    window.location.href = "login.html";
    return;
  }

  initMap();
  loadDonations(volunteerEmail);
});

/* ---------- Initialize Map ---------- */
function initMap() {
  const map = new ol.Map({
    target: "map",
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
    view: new ol.View({
      center: ol.proj.fromLonLat([77.5946, 12.9716]), // India center
      zoom: 12,
    }),
  });

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = ol.proj.fromLonLat([pos.coords.longitude, pos.coords.latitude]);
      map.getView().setCenter(coords);
      map.getView().setZoom(14);

      const marker = new ol.Feature({ geometry: new ol.geom.Point(coords) });
      const markerLayer = new ol.layer.Vector({
        source: new ol.source.Vector({ features: [marker] }),
        style: new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
            scale: 0.07,
          }),
        }),
      });
      map.addLayer(markerLayer);
    });
  }
}

/* ---------- Load Donations (Available + Accepted) ---------- */
async function loadDonations(volunteerEmail) {
  const donationList = document.getElementById("donationList");
  const myDeliveries = document.getElementById("myDeliveries");

  try {
    const res = await fetch(`${API_BASE}/donations`);
    const data = await res.json();

    // Separate Pending and Accepted
    const pending = data.filter((d) => d.status === "Pending");
    const accepted = data.filter(
      (d) => d.collected_by && d.collected_by.toLowerCase() === volunteerEmail.toLowerCase()
    );

    // Render available pickups
    donationList.innerHTML = pending.length
      ? pending.map(renderPickupCard).join("")
      : `<p>No available pickups right now.</p>`;

    // Render accepted deliveries
    myDeliveries.innerHTML = accepted.length
      ? accepted.map(renderAcceptedCard).join("")
      : `<p>You haven’t accepted any deliveries yet.</p>`;
  } catch (err) {
    console.error("Error loading donations:", err);
    donationList.innerHTML = `<p class="text-red-500">Failed to load donations.</p>`;
  }
}

/* ---------- Render Pickup Cards ---------- */
function renderPickupCard(d) {
  return `
    <div class="pickup-card">
      <h3>${d.item}</h3>
      <p><strong>Quantity:</strong> ${d.quantity}</p>
      <p><strong>Location:</strong> ${d.location}</p>
      <p>Status: <span class="text-yellow-600 font-medium">${d.status}</span></p>
      <button onclick="acceptDonation('${d._id}')">🚚 Accept Pickup</button>
    </div>
  `;
}

/* ---------- Render Accepted Deliveries ---------- */
function renderAcceptedCard(d) {
  return `
    <div class="pickup-card" style="border-left-color:#2563eb;">
      <h3>${d.item}</h3>
      <p><strong>Quantity:</strong> ${d.quantity}</p>
      <p><strong>Location:</strong> ${d.location}</p>
      <p>Status: <span class="text-green-700 font-medium">${d.status}</span></p>
      <p><strong>Donated To:</strong> ${d.donated_to || "Awaiting shelter request"}</p>
    </div>
  `;
}

/* ---------- Accept Pickup ---------- */
async function acceptDonation(id) {
  const volunteer = localStorage.getItem("email");
  if (!volunteer) {
    alert("Please log in before accepting a pickup!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/collect_donation/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volunteer }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Pickup accepted successfully!");
      // Immediately update UI — move from Available to My Deliveries
      await loadDonations(volunteer);
    } else {
      alert("⚠️ " + (data.error || "Unable to accept pickup"));
    }
  } catch (err) {
    console.error("Error accepting donation:", err);
    alert("Server error while accepting pickup.");
  }
}
