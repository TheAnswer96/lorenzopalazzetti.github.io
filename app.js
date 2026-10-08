/* Site behaviour: navigation, scroll reveals, small motion touches.
   Loaded with `defer` — the DOM is parsed by the time this runs. */
(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');

  /* ── Back to top (enhancement only, so built here) ───── */
  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>';
  toTop.addEventListener('click', () => window.scrollTo({ top: 0 }));
  document.body.appendChild(toTop);

  /* ── Nav: elevation on scroll ────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nav.classList.toggle('is-scrolled', window.scrollY > 8);
        toTop.classList.toggle('is-shown', window.scrollY > window.innerHeight * 1.2);
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

  /* ── In-page jump bar: mark the section being read ───── */
  // Re-run on `toc:ready`: publications.html builds its year bar after fetching.
  let spy;
  const initToc = () => {
    if (spy) spy.disconnect();
    const links = [...document.querySelectorAll('.toc a[href^="#"]')];
    if (!links.length || !('IntersectionObserver' in window)) return;
    const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
    const mark = (id) => links.forEach((a) => {
      const on = a === byId.get(id);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      // Keep the active chip visible when the bar overflows on phones.
      if (on) a.parentElement.scrollTo({ left: a.offsetLeft - 24, behavior: still ? 'auto' : 'smooth' });
    });
    // A section counts as "current" while it crosses a band near the top.
    spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) mark(e.target.id); });
    }, { rootMargin: '-20% 0px -70% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  };
  initToc();
  window.addEventListener('toc:ready', initToc);

  /* ── Pointer spotlight on cards (fine pointers only) ─── */
  if (!still && matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target instanceof Element && e.target.closest('.card--hover, .entry, .pub-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - r.left + 'px');
      card.style.setProperty('--my', e.clientY - r.top + 'px');
    }, { passive: true });
  }

  /* ── Stat count-up: figures tick up once when first seen ── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && !still && 'IntersectionObserver' in window) {
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        countIo.unobserve(target);
        const final = target.dataset.count;          // e.g. "14" or "20+"
        const n = parseInt(final, 10);
        if (!n) { target.textContent = final; return; }
        const suffix = final.slice(String(n).length);
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / 900, 1);
          target.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => {
      el.dataset.count = el.textContent;             // remember the real figure
      el.textContent = el.textContent.replace(/\d+/, '0');
      countIo.observe(el);
    });
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
