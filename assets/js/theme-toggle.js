// Theme toggle functionality
(() => {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // head.html already resolved and applied the theme before paint —
  // just read it from the attribute so we don't re-declare the same consts
  let currentTheme = html.getAttribute('data-theme') || 'light';

  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  });

  // Follow system preference changes — only when user hasn't manually toggled
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      currentTheme = e.matches ? 'dark' : 'light';
      html.setAttribute('data-theme', currentTheme);
    }
  });
})();
