// lang.js
const translations = {
  en: { title: 'CirclEats', tagline: 'Rescue Food, Nourish Community.' },
  hi: { title: 'सर्कलईट्स', tagline: 'खाद्य बचाओ, समुदाय को पोषण दें।' },
  kn: { title: 'ಸರ್ಕಲ್Eats', tagline: 'ಆಹಾರ ಉಳಿಸಿ, ಸಮುದಾಯಕ್ಕೆ ಪೋಷಣೆ ನೀಡಿ.' }
};

function setLanguage(lang) {
  const t = translations[lang] || translations.en;
  document.getElementById('hero-title').innerText = t.title;
  document.getElementById('hero-tagline').innerText = t.tagline;
}