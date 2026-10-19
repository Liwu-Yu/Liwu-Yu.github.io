'use strict';

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Theme ---------- */
const themeBtn = $('.theme-btn');
function setTheme(theme, persist) {
  document.documentElement.dataset.theme = theme;
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#1e1e2e' : '#eff1f5';
  themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  if (persist) try { localStorage.setItem('liwu-theme-v2', theme); } catch {}
}
setTheme(document.documentElement.dataset.theme || 'light');
themeBtn.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
});

/* ---------- Toast ---------- */
const toastEl = $('#toast');
let toastTimer;
function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

/* ---------- Rotating word ---------- */
const rotWord = $('.rotator-word');
const words = ['scientific discovery', 'human–AI collaboration', 'reliable robot teams'];
if (rotWord && !reduceMotion) {
  let i = 0;
  setInterval(() => {
    i = (i + 1) % words.length;
    rotWord.classList.add('out');
    setTimeout(() => {
      rotWord.textContent = words[i];
      rotWord.classList.remove('out');
      rotWord.classList.add('in');
      requestAnimationFrame(() => requestAnimationFrame(() => rotWord.classList.remove('in')));
    }, 350);
  }, 3200);
}

/* ---------- Local time + status ---------- */
const timeEl = $('#la-time');
const statusEl = $('#la-status');
const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit' });
const hourFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hourCycle: 'h23' });
const statuses = [
  [5, 'one more boss fight, then bed'],
  [8, 'asleep. Hopefully'],
  [11, 'reading papers over coffee'],
  [14, 'in the lab'],
  [18, 'debugging something, YOASOBI on loop'],
  [21, 'training a model'],
  [24, 'deep in a JRPG'],
];
function updateClock() {
  const now = new Date();
  timeEl.textContent = timeFmt.format(now);
  timeEl.dateTime = now.toISOString();
  const hour = Number(hourFmt.format(now)) % 24;
  const status = statuses.find(([until]) => hour < until)[1];
  statusEl.innerHTML = `Liwu is probably <em>${status}</em>.`;
}
updateClock();
setInterval(updateClock, 20000);

/* ---------- Tabs (research + interests) ---------- */
function setupTabs(list, { onSelect } = {}) {
  const tabs = $$('[role="tab"]', list);
  const vertical = list.getAttribute('aria-orientation') === 'vertical';
  function select(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
    });
    if (focus) tab.focus();
    onSelect?.(tab);
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      const prev = vertical ? ['ArrowUp', 'ArrowLeft'] : ['ArrowLeft', 'ArrowUp'];
      const next = vertical ? ['ArrowDown', 'ArrowRight'] : ['ArrowRight', 'ArrowDown'];
      let target;
      if (prev.includes(e.key)) target = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (next.includes(e.key)) target = tabs[(i + 1) % tabs.length];
      else if (e.key === 'Home') target = tabs[0];
      else if (e.key === 'End') target = tabs[tabs.length - 1];
      if (!target) return;
      e.preventDefault();
      select(target, true);
    });
  });
}
setupTabs($('.switcher-list'), {
  onSelect: tab => tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }),
});
setupTabs($('.segmented'));

/* ---------- Lightbox ---------- */
const lightbox = $('.lightbox');
const lightboxImg = $('#lightbox-img');
let lightboxTrigger;
if (typeof lightbox.showModal === 'function') {
  $$('[data-lightbox]').forEach(link => {
    link.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      lightboxTrigger = link;
      lightboxImg.src = link.href;
      lightboxImg.alt = $('img', link).alt;
      $('#lightbox-title').textContent = link.dataset.title;
      lightbox.showModal();
      document.body.classList.add('lightbox-open');
    });
  });
  $('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    lightboxTrigger?.focus({ preventScroll: true });
  });
}


/* ---------- Active nav link ---------- */
const navLinks = $$('.nav a');
const sections = navLinks.map(a => $(a.getAttribute('href')));
function markNav() {
  const y = scrollY + innerHeight * 0.35;
  let current = null;
  sections.forEach((s, i) => { if (s.offsetTop <= y) current = navLinks[i]; });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = navLinks.at(-1);
  navLinks.forEach(a => (a === current ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
}
addEventListener('scroll', markNav, { passive: true });
markNav();

/* ---------- A small secret ---------- */
const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let pos = 0;
addEventListener('keydown', e => {
  if (e.target.closest('input, textarea, [role="tab"]')) return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  pos = key === code[pos] ? pos + 1 : (key === code[0] ? 1 : 0);
  if (pos === code.length) {
    pos = 0;
    toast('↑↑↓↓←→←→BA — 30 extra lives granted.');
  }
});
