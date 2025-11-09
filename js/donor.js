"use strict";

// 🌍 Backend API Base URL
const API_BASE = "https://backend-circleats.onrender.com/api";

(() => {
  let form, imageInput, imagePreview, locationInput, loading;
  let uploadedImage = "";
  let map, marker, currentCoords = null;

  const $ = id => document.getElementById(id);

  /* ---------- Map Setup ---------- */
  window.addEventListener("load", () => {
    map = new ol.Map({
      target: "map",
      layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
      view: new ol.View({
        center: ol.proj.fromLonLat([78.9629, 20.5937]), // India center
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

      // Reverse geocode for location text
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

  /* ---------- Create Donation API Call ---------- */
  async function createDonation(food, qty, loc, expiry, imgData) {
    try {
      const user = JSON.parse(localStorage.getItem("loggedInUser")) || {};
      const user_id = user._id || user.email || "anonymous";

      const payload = {
        user_id,
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
      } else {
        alert(`⚠️ Failed to create donation: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating donation:", err);
      alert("❌ Error creating donation. Check console for details.");
    }
  }

  /* ---------- Submit ---------- */
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

      // Reset form
      form.reset();
      if (imagePreview) imagePreview.innerHTML = "";
      uploadedImage = "";
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    form = $("donation-form");
    imageInput = $("food-image");
    imagePreview = $("image-preview");
    locationInput = $("location-input");
    loading = $("loading");

    setupImagePreview();
    setupSubmit();
  });
})();
