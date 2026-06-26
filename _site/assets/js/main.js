/* =============================================
   WEIRD FISHES ADVISORY - MAIN JS
   ============================================= */

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -64px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ===== DRAG-TO-SCROLL (horizontal tracks) ===== */
document.querySelectorAll('.services-scroll-track').forEach((track) => {
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let hasDragged = false;

  const onDown = (e) => {
    isDragging = true;
    hasDragged = false;
    track.classList.add('is-dragging');
    startX = (e.pageX ?? e.touches[0].pageX) - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const x = (e.pageX ?? e.touches[0].pageX) - track.offsetLeft;
    const delta = (x - startX) * 1.4;
    if (Math.abs(delta) > 4) hasDragged = true;
    track.scrollLeft = scrollLeft - delta;
  };

  const onUp = () => {
    isDragging = false;
    track.classList.remove('is-dragging');
  };

  // Prevent click events on cards if user was dragging
  track.addEventListener('click', (e) => {
    if (hasDragged) e.stopPropagation();
  }, true);

  track.addEventListener('mousedown',  onDown);
  track.addEventListener('mousemove',  onMove);
  track.addEventListener('mouseleave', onUp);
  track.addEventListener('mouseup',    onUp);

  // Touch support
  track.addEventListener('touchstart', onDown, { passive: true });
  track.addEventListener('touchmove',  onMove, { passive: true });
  track.addEventListener('touchend',   onUp);
});

/* ===== SCROLL HINT FADE ===== */
// Hide the "drag →" hint once the user has scrolled the track
document.querySelectorAll('.services-scroll-track').forEach((track) => {
  const hint = track.closest('.services-scroll-section')
                    ?.querySelector('.scroll-hint');
  if (!hint) return;
  track.addEventListener('scroll', () => {
    if (track.scrollLeft > 40) hint.style.opacity = '0';
    else hint.style.opacity = '1';
  }, { passive: true });
});

/* ===== KPI COUNT-UP (hero dashboard) ===== */
// Animates .kpi-count elements from 0 to their data-to value when first
// scrolled into view. data-decimals controls precision, data-suffix appends
// a unit (e.g. "M"). Honours reduced-motion by snapping to the final value.
const countUp = (el) => {
  const target = parseFloat(el.dataset.to);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const suffix = el.dataset.suffix || '';
  const format = (n) => n.toFixed(decimals) + suffix;

  if (prefersReducedMotion) {
    el.textContent = format(target);
    return;
  }

  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    // easeOutCubic for a natural deceleration
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const kpis = document.querySelectorAll('.kpi-count');
if (kpis.length) {
  const kpiObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  kpis.forEach((el) => kpiObserver.observe(el));
}

/* ===== HERO PARALLAX (dashboard drift) ===== */
// Gentle vertical drift on the hero dashboard as the page scrolls, layered
// on top of its existing CSS perspective transform. Skipped for reduced-motion.
const heroDashboard = document.querySelector('.hero-dashboard');
if (heroDashboard && !prefersReducedMotion) {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const shift = Math.min(window.scrollY * 0.04, 28);
      heroDashboard.style.setProperty('--parallax', `${shift}px`);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
