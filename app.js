/* Site behaviour: theme, navigation, scroll reveals.
   Loaded with `defer` — the DOM is parsed by the time this runs. */
(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');

  /* ── Theme ───────────────────────────────────────────── */
  // The initial theme is applied by an inline script in <head> to avoid a
  // flash of the wrong palette; here we only handle toggling.
  const toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    const sync = () => {
      const dark = root.dataset.theme === 'dark';
      toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      toggle.setAttribute('aria-pressed', String(dark));
    };
    sync();
    toggle.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { /* private mode */ }
      sync();
    });
  }

  /* ── Nav: elevation on scroll ────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nav.classList.toggle('is-scrolled', window.scrollY > 8);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Nav: mobile drawer ──────────────────────────────── */
  const burger = document.querySelector('[data-drawer-toggle]');
  const drawer = document.getElementById('nav-drawer');
  if (burger && drawer) {
    const setOpen = (open) => {
      drawer.dataset.open = String(open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => setOpen(drawer.dataset.open !== 'true'));
    drawer.addEventListener('click', (e) => { if (e.target.tagName === 'A') setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.dataset.open === 'true') { setOpen(false); burger.focus(); }
    });
    // Drawer is a small-screen affordance only; close it if the viewport grows.
    matchMedia('(min-width: 721px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ── Nav: active link ────────────────────────────────── */
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a[href$=".html"]').forEach((a) => {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  /* ── Scroll reveal ───────────────────────────────────── */
  const targets = document.querySelectorAll('.reveal');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (still || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    targets.forEach((el) => io.observe(el));
  }

  /* Stagger siblings inside a [data-stagger] container (40ms apart). */
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => {
      if (child.classList.contains('reveal')) {
        child.style.setProperty('--reveal-delay', Math.min(i, 6) * 40 + 'ms');
      }
    });
  });
})();
