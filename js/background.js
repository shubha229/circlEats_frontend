// Select all background buttons (if any)
const bgButtons = document.querySelectorAll('.background-picker button');

// Get the main container (can be <body> or a wrapper div)
const mainContainer = document.querySelector('body'); // or '.auth-page', '.dashboard-page', etc.

// Load saved background on page load
const savedBg = localStorage.getItem('globalBg');
if (savedBg && mainContainer) {
  mainContainer.style.backgroundImage = `url('${savedBg}')`;
  mainContainer.style.backgroundSize = 'cover';
  mainContainer.style.backgroundPosition = 'center';
  mainContainer.style.backgroundAttachment = 'fixed'; // Ensure the background stays fixed
}

// Add click listeners to buttons for changing the background dynamically
bgButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const bgUrl = btn.getAttribute('data-bg');
    if (mainContainer) {
      mainContainer.style.backgroundImage = `url('${bgUrl}')`;
      mainContainer.style.backgroundSize = 'cover';
      mainContainer.style.backgroundPosition = 'center';
      mainContainer.style.backgroundAttachment = 'fixed'; // Ensure fixed background
      // Save selection globally
      localStorage.setItem('globalBg', bgUrl);
    }
  });
});
console.log("Saved background: ", savedBg); // Debugging log
if (savedBg && mainContainer) {
  console.log("Applying saved background...");
  mainContainer.style.backgroundImage = `url('${savedBg}')`;
  mainContainer.style.backgroundSize = 'cover';
  mainContainer.style.backgroundPosition = 'center';
  mainContainer.style.backgroundAttachment = 'fixed';
}
