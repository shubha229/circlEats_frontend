/* script.js — smooth scroll + small UI helpers */

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e){
    e.preventDefault();
    const el = document.querySelector(this.getAttribute('href'));
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

// small header shadow on scroll
document.addEventListener('scroll', function(){
  const header = document.querySelector('.site-header');
  if(!header) return;
  if(window.scrollY > 40) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});
// Scroll fade-in animation
const sections = document.querySelectorAll('section');
window.addEventListener('scroll', () => {
  const triggerBottom = window.innerHeight * 0.85;
  sections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop < triggerBottom) {
      section.classList.add('show');
    }
  });
});

const loginForm = document.querySelector('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    
    if (users[email]) {
      localStorage.setItem('loggedInUser', email);
      window.location.href = 'dashboard.html';
    } else {
      alert("User not found!");
    }
  });
}
// Load user data dynamically
const dashboard = document.querySelector('.user-stats');
if (dashboard) {
  const email = localStorage.getItem('loggedInUser');
  if (email && users[email]) {
    const user = users[email];
    document.querySelector('#donation-count').textContent = user.donations;
    document.querySelector('#volunteer-count').textContent = user.volunteer;
    document.querySelector('#shelter-count').textContent = user.shelters;

    const header = document.querySelector('.dashboard-header h1');
    if (header) {
      header.textContent = `Welcome, ${user.name} 👋`;
    }
  } else {
    window.location.href = 'login.html';
  }
}

// Logout functionality
const logoutBtn = document.querySelector('#logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
  });
}
