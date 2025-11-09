"use strict";

// 🌍 Backend API base URL
const API_BASE = "https://backend-circleeats.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));

  // Redirect if not logged in
  if (!loggedIn || !loggedIn.email) {
    window.location.href = "login.html";
    return;
  }

  const { name, email, role } = loggedIn;

  /* ---------- Welcome + Basic Info ---------- */
  const welcomeBox = document.getElementById("welcomeBox");
  if (welcomeBox) {
    welcomeBox.innerHTML = `
      <h3>Welcome back 👋</h3>
      <p><strong>${name || "User"}</strong></p>
      <p class="muted">${email}</p>
      <p class="muted">Role: <strong>${role}</strong></p>
    `;
  }

  const statDonated = document.getElementById("statDonated");
  const statDeliveries = document.getElementById("statDeliveries");
  const statShelters = document.getElementById("statShelters");
  const contentArea = document.getElementById("contentArea");

  /* ---------- Fetch All Donations ---------- */
  async function fetchDonations() {
    try {
      const res = await fetch(`${API_BASE}/donations`);
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      // Filter donations by user role
      if (role.toLowerCase() === "donor") {
        return data.filter(d => d.user_id && d.user_id === loggedIn._id);
      } else if (role.toLowerCase() === "volunteer") {
        return data.filter(d => d.collected_by === email);
      } else if (role.toLowerCase() === "shelter") {
        return data.filter(d => d.donated_to === email);
      } else {
        return data;
      }
    } catch (err) {
      console.error("Error fetching donations:", err);
      return [];
    }
  }

  /* ---------- Update Stats ---------- */
  async function updateStats() {
    const donations = await fetchDonations();

    const donated = donations.filter(d => d.status === "Donated").length;
    const collected = donations.filter(d => d.status === "Collected").length;
    const pending = donations.filter(d => d.status === "Pending").length;

    if (statDonated) statDonated.textContent = donated;
    if (statDeliveries) statDeliveries.textContent = collected;
    if (statShelters) statShelters.textContent = pending;
  }

  /* ---------- Render Activity ---------- */
  async function renderActivity() {
    const donations = await fetchDonations();
    if (!contentArea) return;

    if (donations.length === 0) {
      contentArea.innerHTML = `<p>No activity yet. Start making an impact today!</p>`;
      return;
    }

    contentArea.innerHTML = `
      <h3>Your Recent Activity</h3>
      <ul class="activity-list mt-2">
        ${donations
          .map(d => {
            let icon = "🍽";
            if (d.status === "Pending") icon = "🕒";
            if (d.status === "Collected") icon = "🚚";
            if (d.status === "Donated") icon = "🏠";
            return `<li>${icon} <strong>${d.item}</strong> — ${d.status} (${d.location})</li>`;
          })
          .join("")}
      </ul>
    `;
  }

  /* ---------- Render Donations ---------- */
  async function renderDonations() {
    const donations = await fetchDonations();
    if (!contentArea) return;

    if (donations.length === 0) {
      contentArea.innerHTML = `<p>No donations found.</p>`;
      return;
    }

    contentArea.innerHTML = `
      <h3>Your Donations</h3>
      <div class="grid gap-3 mt-3">
        ${donations
          .map(
            d => `
          <div class="card border-l-4 p-3 rounded shadow-sm ${d.status === "Donated" ? "border-green-500" : d.status === "Collected" ? "border-blue-400" : "border-yellow-400"}">
            <h4 class="font-semibold">${d.item}</h4>
            <p>Quantity: ${d.quantity}</p>
            <p>Location: ${d.location}</p>
            <p>Status: <strong>${d.status}</strong></p>
            ${d.collected_by ? `<p>Volunteer: ${d.collected_by}</p>` : ""}
            ${d.donated_to ? `<p>Shelter: ${d.donated_to}</p>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  /* ---------- Render Volunteer View ---------- */
  async function renderVolunteer() {
    const donations = await fetchDonations();
    if (!contentArea) return;

    const assigned = donations.filter(d => d.collected_by === email);

    contentArea.innerHTML = `
      <h3>Your Deliveries</h3>
      ${
        assigned.length
          ? assigned
              .map(
                d => `
          <div class="card border-l-4 border-blue-400 p-3 rounded shadow-sm">
            <h4>${d.item}</h4>
            <p>Quantity: ${d.quantity}</p>
            <p>Destination: ${d.donated_to || "Awaiting shelter"}</p>
            <p>Status: <strong>${d.status}</strong></p>
          </div>
        `
              )
              .join("")
          : `<p>You haven’t accepted any deliveries yet.</p>`
      }
    `;
  }

  /* ---------- Render Profile ---------- */
  function renderProfile() {
    if (!contentArea) return;
    contentArea.innerHTML = `
      <h3>Your Profile</h3>
      <p><strong>Name:</strong> ${name || "N/A"}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Role:</strong> ${role}</p>
      <button id="logoutBtn" class="mt-3 bg-red-500 text-white px-3 py-1 rounded">Logout</button>
    `;

    document.getElementById("logoutBtn").onclick = () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    };
  }

  /* ---------- Button Navigation ---------- */
  const buttons = document.querySelectorAll(".buttons-row .btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const target = btn.getAttribute("data-target");
      switch (target) {
        case "activity": await renderActivity(); break;
        case "donations": await renderDonations(); break;
        case "volunteer": await renderVolunteer(); break;
        case "profile": renderProfile(); break;
        default:
          contentArea.innerHTML = `<p>Select a section to view details.</p>`;
      }
    });
  });

  /* ---------- Initialize ---------- */
  updateStats();
  renderActivity(); // Default view
});
