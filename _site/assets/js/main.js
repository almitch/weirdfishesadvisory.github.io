/* =============================================
   WEIRD FISHES ADVISORY - MAIN JS
   ============================================= */

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
