// Theme toggle functionality
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Get current theme
  let currentTheme = localStorage.getItem('theme') || 'light';

  // Set initial theme
  html.setAttribute('data-theme', currentTheme);

  // Toggle theme only if button exists
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', currentTheme);
      localStorage.setItem('theme', currentTheme);
    });
  } else {
    console.error('Theme toggle button not found');
  }
});