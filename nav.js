// Mobile nav toggle
(function() {
  const btn = document.querySelector('.nav__hamburger');
  const mobile = document.querySelector('.nav__mobile');
  if (!btn || !mobile) return;
  btn.addEventListener('click', () => {
    const open = mobile.style.display === 'flex';
    mobile.style.display = open ? 'none' : 'flex';
  });

  // Active link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();
