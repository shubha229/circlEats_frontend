// utils.js
function showLoading(ms = 1200) {
  const overlay = document.createElement('div');
  overlay.className = "fixed inset-0 flex items-center justify-center bg-black/40 z-50";
  overlay.innerHTML = `<div class="bg-white p-6 rounded-xl shadow-xl text-center">
    <div class="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-3"></div>
    <div class="text-sm text-gray-600">Processing...</div>
  </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), ms);
}

function downloadCSV(filename, content) {
  const blob = new Blob([content], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename + '.csv';
  a.click();
}