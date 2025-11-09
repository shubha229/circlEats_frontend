"use strict";

// 🌍 Backend API base URL
const API_BASE = "https://backend-circleats.onrender.com/api";

// ---------- Volunteer Dashboard ----------
window.addEventListener("DOMContentLoaded", () => {
  // Ensure user is logged in
  const volunteerEmail = localStorage.getItem("email");
  if (!volunteerEmail) {
    alert("Please log in as a volunteer first!");
    window.location.href = "login.html";
    return;
  }

  // Load available donations
  loadDonations();
});

/* 🔹 Load All Donor Listings (Pending Donations) */
async function loadDonations() {
  const listContainer = document.getElementById("donationList") || document.querySelector(".pickup-section");
  if (!listContainer) return;

  try {
    const res = await fetch(`${API_BASE}/donations`);
    const data = await res.json();

    // Clear old content
    listContainer.innerHTML = "";

    // Filter Pending donations only
    const pendingDonations = data.filter(d => d.status === "Pending");

    if (pendingDonations.length === 0) {
      listContainer.innerHTML = `
        <p class="text-gray-500 text-center py-4">
          🎉 All donations are currently picked up or delivered. Check back later!
        </p>`;
      return;
    }

    // Render each pending donation card
    pendingDonations.forEach(d => {
      const card = document.createElement("div");
      card.className = "pickup-card bg-white shadow-md rounded-xl border-l-4 border-green-600 p-4 mb-3";
      card.innerHTML = `
        <h3 class="text-xl font-semibold text-green-700">${d.item}</h3>
        <p><strong>Quantity:</strong> ${d.quantity}</p>
        <p><strong>Location:</strong> ${d.location}</p>
        <p><strong>Status:</strong> 
          <span class="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">${d.status}</span>
        </p>
        <button onclick="acceptDonation('${d._id}')"
          class="mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md shadow-sm">
          🚚 Accept Pickup
        </button>
      `;
      listContainer.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error fetching donations:", err);
    listContainer.innerHTML = `<p class="text-red-500 text-center">Failed to load donations.</p>`;
  }
}

/* 🔹 Accept Donation (Mark as Collected) */
async function acceptDonation(id) {
  const volunteer = localStorage.getItem("email") || "anonymous";

  try {
    const res = await fetch(`${API_BASE}/collect_donation/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volunteer }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Pickup confirmed!");
      loadDonations(); // refresh updated list
    } else {
      alert("⚠️ " + (data.error || "Unable to accept pickup"));
    }
  } catch (err) {
    console.error("❌ Error accepting donation:", err);
    alert("Server error while accepting donation.");
  }
}
