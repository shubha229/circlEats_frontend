// app.js
document.getElementById('year').innerText = new Date().getFullYear();

function switchView(viewId) {
  document.querySelectorAll("section.view-card").forEach(v => v.classList.add("hidden"));
  document.getElementById(viewId).classList.remove("hidden");

  if (viewId === "donor-view") {
    renderDonorView();
    // Delay to ensure DOM is visible
    setTimeout(() => {
      if (window.map) window.map.invalidateSize();
    }, 100);
  }
}


function mockLogin() {
  const role = document.getElementById('auth-role').value;
  showLoading();
  setTimeout(() => switchView(role + '-view'), 1200);
}