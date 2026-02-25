// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Resolve theme: saved preference → system preference → light
const savedTheme = localStorage.getItem('theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let currentTheme = savedTheme || (systemDark ? 'dark' : 'light');

// Sync attribute (head.html already set it before paint, this keeps JS state in sync)
html.setAttribute('data-theme', currentTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', currentTheme);
  localStorage.setItem('theme', currentTheme);
});

// Track system preference changes — only apply when user hasn't set a manual preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    currentTheme = e.matches ? 'dark' : 'light';
    html.setAttribute('data-theme', currentTheme);
  }
});