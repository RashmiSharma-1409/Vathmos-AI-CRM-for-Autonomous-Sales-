// ══════════════════════════════════════════════════════════════════
// THEME.JS — Dark/Light Theme Manager
// ══════════════════════════════════════════════════════════════════

// Instantly apply saved theme to avoid FOUC
(function() {
  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
    document.documentElement.classList.add('light-theme');
  }
})();

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
