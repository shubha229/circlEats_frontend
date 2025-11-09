// js/donor.js
"use strict";

(() => {
  // DOM refs (assigned on DOMContentLoaded)
  let form, listingCards, imageInput, imagePreview, locationInput, loading, mapEl;
  let uploadedImage = "";
  let currentCoords = null;
  let marker = null;
  // expose map variable so switchView can call window.map.invalidateSize()
  window.map = null;
  let typingTimer = null;

  /* ---------- Helpers ---------- */
  const $ = id => document.getElementById(id);

  async function reverseGeocode(lat, lon) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      return data.display_name || "Unknown location";
    } catch (e) {
      console.error("reverseGeocode error", e);
      return "Unknown location";
    }
  }

  async function forwardGeocode(q) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!window.map) initMap();
        if (window.map) {
          window.map.setView([lat, lon], 14);
          if (!marker) marker = L.marker([lat, lon]).addTo(window.map);
          else marker.setLatLng([lat, lon]);
        }
        currentCoords = [lat, lon];
      }
    } catch (e) {
      console.error("forwardGeocode error", e);
    }
  }

  /* ---------- Map ---------- */
  function ensureMapHeight() {
    if (!mapEl) return;
    const h = parseInt(window.getComputedStyle(mapEl).height, 10);
    if (!h || h === 0) mapEl.style.height = "300px";
  }

  function initMap() {
    mapEl = $("map");
    if (!mapEl) {
      console.warn("initMap: #map element not found");
      return;
    }

    ensureMapHeight();

    // avoid double init
    if (window.map && window.map._leaflet_id) {
      try { window.map.invalidateSize(); } catch (e) {}
      return;
    }

    window.map = L.map("map", { zoomControl: true }).setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(window.map);

    // center on user (non-blocking)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        try {
          const lat = pos.coords.latitude, lon = pos.coords.longitude;
          window.map.setView([lat, lon], 14);
          if (!marker) marker = L.marker([lat, lon]).addTo(window.map);
          else marker.setLatLng([lat, lon]);
          currentCoords = [lat, lon];
          if (locationInput) locationInput.value = await reverseGeocode(lat, lon);
        } catch (err) {
          console.warn("geolocation handler error", err);
        }
      }, () => { /* ignore */ });
    }

    // click to pick location
    window.map.on("click", async e => {
      const { lat, lng } = e.latlng;
      if (!marker) marker = L.marker([lat, lng]).addTo(window.map);
      else marker.setLatLng([lat, lng]);
      currentCoords = [lat, lng];
      if (locationInput) locationInput.value = await reverseGeocode(lat, lng);
    });

    // safety invalidate
    setTimeout(() => { try { window.map.invalidateSize(); } catch (e) {} }, 300);
  }

  /* ---------- Image preview ---------- */
  function setupImagePreview() {
    if (!imageInput) return;
    imageInput.addEventListener("change", e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = ev => {
        uploadedImage = ev.target.result;
        if (imagePreview) imagePreview.innerHTML = `<img src="${uploadedImage}" class="rounded-lg mt-2 w-full h-40 object-cover shadow">`;
      };
      r.readAsDataURL(f);
    });
  }

  /* ---------- Card actions & localStorage ---------- */
  function saveListings() {
    if (!listingCards) return;
    localStorage.setItem("donorListings", listingCards.innerHTML);
  }

  function loadListings() {
    if (!listingCards) return;
    const saved = localStorage.getItem("donorListings");
    if (saved) {
      listingCards.innerHTML = saved;
      attachCardEvents();
    }
  }

  function attachCardEvents() {
    if (!listingCards) return;

    listingCards.querySelectorAll(".cancel-btn").forEach(btn => {
      btn.onclick = () => {
        const c = btn.closest(".card");
        if (c) c.remove();
        saveListings();
      };
    });

    listingCards.querySelectorAll(".collected-btn").forEach(btn => {
      btn.onclick = () => {
        const c = btn.closest(".card");
        if (!c) return;
        c.classList.add("collected");
        btn.remove();
        saveListings();
      };
    });

    listingCards.querySelectorAll(".reserve-btn").forEach(btn => {
      btn.onclick = () => {
        const c = btn.closest(".card");
        if (!c) return;
        c.classList.toggle("reserved");
        if (c.querySelector(".reserved-label")) {
          c.querySelector(".reserved-label").remove();
          btn.textContent = "🛎 Reserve";
        } else {
          const label = document.createElement("div");
          label.className = "reserved-label";
          label.textContent = "Reserved";
          c.appendChild(label);
          btn.textContent = "❌ Cancel Reservation";
        }
        saveListings();
      };
    });
  }

  /* ---------- Submit handler ---------- */
  function setupSubmit() {
    if (!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();

      const name = $("food-name") ? $("food-name").value.trim() : "";
      const food = $("food-type") ? $("food-type").value : "";
      const qty = $("quantity") ? $("quantity").value : "";
      const expiry = $("expiry") ? $("expiry").value : "";
      const loc = $("location-input") ? $("location-input").value.trim() : "";

      // basic validation
      if (!food || !qty || !expiry || !loc) {
        alert("⚠️ Please fill all required fields (type, quantity, expiry, location).");
        return;
      }

      const expiryDate = new Date(expiry);
      const now = new Date();
      if (isNaN(expiryDate)) {
        alert("⚠️ Expiry date/time is invalid.");
        return;
      }
      if (expiryDate < now) {
        alert("⚠️ Expiry must be a future date/time.");
        return;
      }

      // show loading UI if present
      if (loading) loading.classList.remove("hidden");

      // build card
      const card = document.createElement("div");
      card.className = "card p-4 bg-white rounded-xl shadow-lg border-l-4 border-green-500 flex flex-col justify-between";
      card.innerHTML = `
        <div>
          ${uploadedImage ? `<img src="${uploadedImage}" class="rounded-lg mb-3 w-full h-40 object-cover">` : ""}
          ${name ? `<h3 class="text-lg font-semibold text-gray-800 mb-1">${name}</h3>` : ""}
          <h3 class="text-xl font-bold text-green-700 mb-2">${food}</h3>
          <p>🍽 Quantity: ${qty} servings</p>
          <p>📅 Expiry: ${expiryDate.toLocaleString()}</p>
          <p>📍 Location: ${loc}</p>
        </div>
        <div class="flex justify-between mt-4">
          <button class="collected-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm">✅ Food Collected</button>
          <button class="reserve-btn bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm">🛎 Reserve</button>
          <button class="cancel-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm">❌ Cancel</button>
        </div>
      `;

      listingCards.appendChild(card);
      attachCardEvents();
      saveListings();

      // cleanup
      form.reset();
      if (imagePreview) imagePreview.innerHTML = "";
      uploadedImage = "";
      if (loading) loading.classList.add("hidden");
      // optional small success feedback
      // alert("Listing created!");
    });
  }

  /* ---------- Debounced forward geocode when user types ---------- */
  function setupLocationTyping() {
    if (!locationInput) return;
    locationInput.addEventListener("input", () => {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        const val = locationInput.value.trim();
        if (val) forwardGeocode(val);
      }, 1000);
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    // assign refs
    form = $("donation-form");
    listingCards = $("listing-cards");
    imageInput = $("food-image");
    imagePreview = $("image-preview");
    locationInput = $("location-input");
    loading = $("loading");
    mapEl = $("map");

    // wire things
    setupImagePreview();
    setupLocationTyping();
    setupSubmit();

    // init map lazily — if donor view is visible, init now.
    // if you use SPA switching, call initMap() again (it guards double-init)
    initMap();

    // load saved listings
    loadListings();

    // run expiry check every minute
    setInterval(() => {
      if (!listingCards) return;
      listingCards.querySelectorAll(".card").forEach(card => {
        const pList = Array.from(card.querySelectorAll("p"));
        const expiryP = pList.find(p => p.textContent && p.textContent.trim().startsWith("📅 Expiry:"));
        if (!expiryP) return;
        const expiryText = expiryP.textContent.replace("📅 Expiry: ", "").trim();
        const d = new Date(expiryText);
        if (!isNaN(d) && d < new Date() && !card.classList.contains("collected")) {
          card.classList.add("expired");
        }
      });
    }, 60000);
  });

})();
