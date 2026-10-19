// Apply the saved theme (or the system preference) before the page paints.
(() => {
  const root = document.documentElement;
  let theme;
  try { theme = localStorage.getItem('liwu-theme-v2'); } catch {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.dataset.theme = theme;
  root.classList.add('js');
})();
