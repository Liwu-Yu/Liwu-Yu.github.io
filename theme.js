// Resolve the saved preference before the page paints. New visits follow the system.
(() => {
  const root = document.documentElement;
  let mode = 'system';
  try { mode = localStorage.getItem('liwu-theme-v2') || 'system'; } catch {}
  if (!['system', 'light', 'dark'].includes(mode)) mode = 'system';
  const theme = mode === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  root.dataset.themeMode = mode;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#1e1e2e' : '#eff1f5';
  root.classList.add('js');
})();
