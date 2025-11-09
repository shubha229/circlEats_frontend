// ============================
// USER DASHBOARD LOGIC
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));

  // Redirect if not logged in
  if (!loggedIn || !loggedIn.email) {
    window.location.href = "login.html";
    return;
  }

  const { name, email, role, donations = [], volunteering = [], shelters = [] } = loggedIn;

  // --- Welcome Box ---
  const welcomeBox = document.getElementById("welcomeBox");
  if (welcomeBox) {
    welcomeBox.innerHTML = `
      <h3>Welcome back 👋</h3>
      <p><strong>${name || "User"}</strong></p>
      <p class="muted">${email}</p>
      <p class="muted">Role: <strong>${role}</strong></p>
    `;
  }

  // --- Stats Section ---
  const donatedAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalDeliveries = volunteering.length;
  const totalShelters = shelters.length;

  document.getElementById("statDonated").textContent = `₹${donatedAmount}`;
  document.getElementById("statDeliveries").textContent = totalDeliveries;
  document.getElementById("statShelters").textContent = totalShelters;

  // --- Logout Button ---
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    };
  }

  // --- Button-based content switching ---
  const buttons = document.querySelectorAll(".buttons-row .btn");
  const contentArea = document.getElementById("contentArea");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");

      switch (target) {
        case "activity":
          contentArea.innerHTML = `
            <h3>Your Recent Activity</h3>
            ${
              donations.length || volunteering.length || shelters.length
                ? `
                  <ul class="activity-list">
                    ${donations.map(d => `<li>💰 Donated ₹${d.amount} to ${d.cause || "a cause"}</li>`).join("")}
                    ${volunteering.map(v => `<li>🤝 Volunteered at ${v.event || "an event"}</li>`).join("")}
                    ${shelters.map(s => `<li>🏠 Helped shelter: ${s.name || "Unknown Shelter"}</li>`).join("")}
                  </ul>`
                : `<p>No activity yet. Start making an impact today!</p>`
            }
          `;
          break;

        case "donations":
          contentArea.innerHTML = `
            <h3>Your Donations</h3>
            ${
              donations.length
                ? donations.map(d => `
                    <div class="card">
                      <strong>₹${d.amount}</strong> — ${d.cause || "Unknown cause"}
                    </div>
                  `).join("")
                : `<p>You haven’t donated yet. Start contributing to shelters!</p>`
            }
          `;
          break;

        case "volunteer":
          contentArea.innerHTML = `
            <h3>Volunteer Opportunities</h3>
            <p>Check upcoming drives and events near you.</p>
          `;
          break;

        case "profile":
          contentArea.innerHTML = `
            <h3>Your Profile</h3>
            <p><strong>Name:</strong> ${name || "N/A"}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Role:</strong> ${role}</p>
          `;
          break;

        default:
          contentArea.innerHTML = `<p>Select a section to view details.</p>`;
      }
    });
  });

  // --- Default view ---
  document.querySelector('.buttons-row .btn[data-target="activity"]').click();
});
