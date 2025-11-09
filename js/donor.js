"use strict";

// 🌍 Backend API base URL
const API_BASE = "https://backend-circleats.onrender.com/api";

(() => {
  let form, listingCards, imageInput, imagePreview, locationInput, loading;
  let uploadedImage = "";
  let map, marker, currentCoords = null;

  const $ = id => document.getElementById(id);

  /* ---------- Map Setup ---------- */
  window.addEventListener("load", () => {
    map = new ol.Map({
      target: "map",
      layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
      view: new ol.View({
        center: ol.proj.fromLonLat([78.9629, 20.5937]), // India
        zoom: 5,
      }),
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

  /* ---------- Save Donation ---------- */
  async function createDonation(food, qty, loc) {
    try {
      const user_id = localStorage.getItem("user_id");
      const res = await fetch(`${API_BASE}/create_donation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, item: food, quantity: qty, location: loc }),
      });
      const data = await res.json();
      alert(data.message || "Donation created successfully!");
    } catch (err) {
      console.error("Error creating donation:", err);
      alert("Error creating donation. Please try again.");
    }
  }

  /* ---------- Submit ---------- */
  function setupSubmit() {
    if (!form) return;
    form.addEventListener("submit", e => {
      e.preventDefault();
      const food = $("food-type").value;
      const qty = $("quantity").value;
      const loc = $("location-input").value;

      if (!food || !qty || !loc) {
        alert("⚠️ Please fill all fields before submitting.");
        return;
      }

      createDonation(food, qty, loc);

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
    listingCards = $("listing-cards");
    loading = $("loading");
    setupImagePreview();
    setupSubmit();
  });
})();

