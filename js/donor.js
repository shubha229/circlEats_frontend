"use strict";

// 🌍 Backend API Base URL
const API_BASE = "https://backend-circleats.onrender.com/api";

(() => {
  let form, imageInput, imagePreview, locationInput;
  let uploadedImage = "";
  let map, marker, currentCoords = null;

  const $ = id => document.getElementById(id);

  /* ---------- Map Setup ---------- */
  window.addEventListener("load", () => {
    map = new ol.Map({
      target: "map",
      layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
      view: new ol.View({
        center: ol.proj.fromLonLat([78.9629, 20.5937]), // Center on India
        zoom: 5,
      }),
    });

    // Add click-to-select-location on map
    map.on("click", async evt => {
      const coord = ol.proj.toLonLat(evt.coordinate);
      const [lon, lat] = coord;
      currentCoords = { lat, lon };

      // Add marker
      if (marker) map.removeLayer(marker);
      const markerFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
      });
      const markerStyle = new ol.style.Style({
        image: new ol.style.Icon({
          src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          scale: 0.05,
        }),
      });
      markerFeature.setStyle(markerStyle);
      const vectorSource = new ol.source.Vector({ features: [markerFeature] });
      marker = new ol.layer.Vector({ source: vectorSource });
      map.addLayer(marker);

      // Reverse geocode for human-readable location
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await res.json();
        if (data.display_name && locationInput) {
          locationInput.value = data.display_name;
        }
      } catch (err) {
        console.warn("Reverse geocoding failed:", err);
      }
    });
  });

  /* ---------- Image Preview ---------- */
  function setupImagePreview() {
    if (!imageInput) return;
    imageInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        uploadedImage = ev.target.result;
        imagePreview.innerHTML = `<img src="${uploadedImage}" class="rounded-lg mt-2 w-full h-40 object-cover shadow">`;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- Create Donation ---------- */
  async function createDonation(food, qty, loc, expiry, imgData) {
    try {
      // ✅ Use consistent storage keys from auth.js
      const user_id = localStorage.getItem("user_id") || "anonymous";
      const email = localStorage.getItem("email") || "unknown";

      const payload = {
        user_id,
        donor_email: email,
        item: food,
        quantity: qty,
        location: loc,
        image: imgData || "",
        expiry,
        status: "Pending",
        created_at: new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE}/create_donation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Donation posted successfully!");
        console.log("Created donation:", data);
        await loadMyDonations(); // 🔁 Refresh the donor listings immediately
      } else {
        alert(`⚠️ Failed to create donation: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating donation:", err);
      alert("❌ Error creating donation. Check console for details.");
    }
  }

  /* ---------- Load My Donations ---------- */
  async function loadMyDonations() {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return;

    try {
      const res = await fetch(`${API_BASE}/my_donations/${user_id}`);
      const data = await res.json();

      const container = $("listing-cards");
      if (!container) return;

      container.innerHTML = "";

      if (!data.length) {
        container.innerHTML = `<p class="text-gray-500 text-center py-4">No listings yet. Create your first donation!</p>`;
        return;
      }

      data.forEach(d => {
        const card = document.createElement("div");
        card.className = "bg-white border-l-4 border-green-600 shadow-md rounded-xl p-4 mb-3";
        card.innerHTML = `
          <h3 class="text-lg font-semibold text-green-700">${d.item}</h3>
          <p><strong>Quantity:</strong> ${d.quantity}</p>
          <p><strong>Location:</strong> ${d.location}</p>
          <p><strong>Status:</strong> <span class="text-gray-700">${d.status}</span></p>
          ${d.collected_by ? `<p><strong>Volunteer:</strong> ${d.collected_by}</p>` : ""}
          ${d.donated_to ? `<p><strong>Shelter:</strong> ${d.donated_to}</p>` : ""}
        `;
        container.appendChild(card);
      });
    } catch (err) {
      console.error("Error loading donations:", err);
    }
  }

  /* ---------- Submit Handler ---------- */
  function setupSubmit() {
    if (!form) return;
    form.addEventListener("submit", e => {
      e.preventDefault();

      const food = $("food-type").value.trim();
      const qty = $("quantity").value.trim();
      const loc = $("location-input").value.trim();
      const expiry = $("expiry") ? $("expiry").value : "";

      if (!food || !qty || !loc) {
        alert("⚠️ Please fill all fields before submitting.");
        return;
      }

      createDonation(food, qty, loc, expiry, uploadedImage);

      // Reset form UI
      form.reset();
      if (imagePreview) imagePreview.innerHTML = "";
      uploadedImage = "";
    });
  }

  /* ---------- Initialize ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    form = $("donation-form");
    imageInput = $("food-image");
    imagePreview = $("image-preview");
    locationInput = $("location-input");

    setupImagePreview();
    setupSubmit();
    loadMyDonations(); // ✅ Show listings when page loads
  });
})();
