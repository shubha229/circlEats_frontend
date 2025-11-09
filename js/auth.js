// =======================
// CircleEats Authentication Logic (Connected to Flask + MongoDB Atlas)
// =======================

// ✅ Your deployed backend URL
const API_BASE = "https://shubha22nayak-circleats_backend.hf.space/api";


// -----------------------
// Handle Signup
// -----------------------
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Account created successfully! Please log in.");
        window.location.href = "login.html";
      } else {
        alert(data.error || "Signup failed. Try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Server error. Please try again later.");
    }
  });
}

// -----------------------
// Handle Login
// -----------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_name", data.name);

        alert(`🎉 Welcome back, ${data.name}!`);
        window.location.href = "dvs.html"; // or user-dashboard.html
      } else {
        alert(data.error || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again later.");
    }
  });
}

// -----------------------
// Logout Helper
// -----------------------
function logout() {
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_name");
  window.location.href = "login.html";
}

document.getElementById("logoutBtn")?.addEventListener("click", logout);
