/* =============================================
   WEIRD FISHES ADVISORY - "THE DIVE"
   Depth tracking (nav, gauge, marine snow) runs on a plain scroll listener.
   Decorative motion uses GSAP + ScrollTrigger inside gsap.matchMedia()
   so reduced-motion visitors get a calm, static page.
   ============================================= */
(() => {
  'use strict';

  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DARK_ZONES = new Set(['twilight', 'midnight', 'abyss']);

  /* ---------- Expand / collapse panels (services + "How it was done") ---------- */
  const togglePanel = (btn, panel) => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));

    if (!hasGsap || reduceMotion) {
      panel.hidden = open;
      if (hasGsap) ScrollTrigger.refresh();
      measureZones();
      return;
    }
    const done = () => { ScrollTrigger.refresh(); measureZones(); };
    if (open) {
      gsap.to(panel, {
        height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut',
        onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: 'height,opacity' }); done(); },
      });
    } else {
      panel.hidden = false;
      gsap.fromTo(panel, { height: 0, opacity: 0 }, {
        height: 'auto', opacity: 1, duration: 0.65, ease: 'back.out(1.1)',
        onComplete: () => { gsap.set(panel, { clearProps: 'height' }); done(); },
      });
      gsap.from(panel.querySelectorAll('h3, h4, p, li, dt, dd'), {
        y: 14, opacity: 0, duration: 0.5, stagger: 0.03, ease: 'power3.out', delay: 0.1,
      });
    }
  };
  document.querySelectorAll('button[aria-controls]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (panel) btn.addEventListener('click', () => togglePanel(btn, panel));
  });

  /* ---------- Depth tracking: nav theme, gauge, snow intensity ---------- */
  const header = document.querySelector('[data-nav]');
  const gauge = document.querySelector('[data-gauge]');
  const gaugeFill = document.querySelector('[data-gauge-fill]');
  const gaugeMarker = document.querySelector('[data-gauge-marker]');
  const zoneSections = [...document.querySelectorAll('[data-zone]')];

  // One gauge label per page section, placed where that section starts
  const gaugeItems = gauge ? [...gauge.querySelectorAll('[data-gauge-target]')] : [];
  let sectionStarts = [];
  let maxScroll = 1;

  function measureZones() {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    sectionStarts = gaugeItems.map((li) => {
      const el = document.querySelector(li.dataset.gaugeTarget);
      const start = el ? el.getBoundingClientRect().top + window.scrollY : 0;
      const p = Math.min(1, Math.max(0, start / maxScroll));
      li.style.top = `${(p * 100).toFixed(2)}%`;
      return { li, start };
    });
  }

  const zoneAt = (y) => {
    for (const s of zoneSections) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) return s.dataset.zone;
    }
    return null;
  };
  const setTheme = (el, zone) => {
    if (!el || !zone) return;
    const theme = DARK_ZONES.has(zone) ? 'theme-dark' : 'theme-light';
    if (!el.classList.contains(theme)) {
      el.classList.remove('theme-dark', 'theme-light');
      el.classList.add(theme);
    }
  };

  let progress = 0;
  let ticking = false;
  function updateDepth() {
    ticking = false;
    const y = window.scrollY;
    progress = Math.min(1, Math.max(0, y / maxScroll));

    if (header) {
      header.classList.toggle('is-scrolled', y > 60);
      setTheme(header, zoneAt(36));
    }
    if (gauge) {
      setTheme(gauge, zoneAt(window.innerHeight * 0.5));
      // Step aside at the seabed so the banner fish aren't covered
      const seabed = document.querySelector('.seabed');
      if (seabed) gauge.classList.toggle('is-hidden', seabed.getBoundingClientRect().top < window.innerHeight * 0.75);
      if (gaugeFill) gaugeFill.style.height = `${progress * 100}%`;
      if (gaugeMarker) gaugeMarker.style.top = `${progress * 100}%`;
      const probe = y + window.innerHeight * 0.35;
      let current = sectionStarts[0] && sectionStarts[0].li;
      sectionStarts.forEach(({ li, start }) => { if (probe >= start) current = li; });
      gaugeItems.forEach((li) => li.classList.toggle('is-current', li === current));
    }
  }
  const requestDepth = () => { if (!ticking) { ticking = true; requestAnimationFrame(updateDepth); } };
  window.addEventListener('scroll', requestDepth, { passive: true });
  window.addEventListener('resize', () => { measureZones(); requestDepth(); }, { passive: true });
  window.addEventListener('load', () => { measureZones(); requestDepth(); if (hasGsap) ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measureZones(); requestDepth(); });
  measureZones();
  updateDepth();

  /* ---------- Marine snow: specks that thicken as you sink ---------- */
  const canvas = document.querySelector('[data-snow]');
  if (canvas && !reduceMotion && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, flakes = [];
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(44, (w * h) / 30000));
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.4 + Math.random() * 0.8,
        vy: 0.06 + Math.random() * 0.18,
        sway: Math.random() * Math.PI * 2,
        a: 0.08 + Math.random() * 0.22,
      }));
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(draw);
    });

    function draw() {
      if (!running) return;
      // Starts below the waterline, peaks in the abyss
      const intensity = 0.5 * Math.min(1, Math.max(0, (progress - 0.12) / 0.6));
      canvas.style.opacity = intensity.toFixed(3);
      ctx.clearRect(0, 0, w, h);
      if (intensity > 0.01) {
        for (const f of flakes) {
          f.y += f.vy;
          f.sway += 0.006;
          const x = f.x + Math.sin(f.sway) * 5;
          if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
          ctx.globalAlpha = f.a;
          ctx.fillStyle = '#a9c2c4';
          ctx.beginPath();
          ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ---------- "How it was done" overlays ---------- */
  let lastTrigger = null;
  const openDialog = (dialog, trigger) => {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    lastTrigger = trigger;
    dialog.showModal();
    document.body.classList.add('has-dialog');
    const inner = dialog.querySelector('.wd-inner');
    if (hasGsap && !reduceMotion && inner) {
      gsap.fromTo(inner, { y: 40, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' });
      gsap.from(dialog.querySelectorAll('.wd-star > div'), { y: 18, opacity: 0, duration: 0.5, stagger: 0.07, delay: 0.15, ease: 'power3.out' });
    }
  };
  const closeDialog = (dialog) => {
    if (!dialog.open) return;
    dialog.close();
  };
  document.querySelectorAll('[data-dialog-open]').forEach((btn) => {
    const dialog = document.getElementById(btn.dataset.dialogOpen);
    btn.addEventListener('click', () => openDialog(dialog, btn));
  });
  document.querySelectorAll('.work-dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('has-dialog');
      if (lastTrigger) lastTrigger.focus();
    });
    dialog.querySelectorAll('[data-dialog-close]').forEach((b) => b.addEventListener('click', () => closeDialog(dialog)));
    // Click on the backdrop (outside the panel) closes it
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(dialog); });
  });

  /* ---------- Count-up for stat chips ---------- */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.to);
    const finalText = el.textContent;
    if (reduceMotion || !hasGsap || Number.isNaN(target)) return;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power3.out',
      onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('en-GB'); },
      onComplete: () => { el.textContent = finalText; },
    });
  };

  if (!hasGsap) return;

  /* ---------- Nav: underline the section in view ---------- */
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    ScrollTrigger.create({
      trigger: target, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });

  document.querySelectorAll('.count[data-to]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => countUp(el) });
  });

  /* ---------- Decorative motion ---------- */
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    /* Hero title: split into words and let them bob up out of the water */
    const heroTitle = document.querySelector('.hero .section-title');
    if (heroTitle && !heroTitle.querySelector('.word')) {
      const words = heroTitle.textContent.trim().split(/\s+/);
      heroTitle.innerHTML = words.map((w) => `<span class="word">${w}</span>`).join(' ');
    }
    const heroHead = document.querySelector('.hero .section-head');
    const intro = gsap.timeline({ defaults: { ease: 'back.out(1.5)' } });
    intro
      .from('.hero .section-title .word', { y: 70, opacity: 0, rotate: 4, duration: 0.9, stagger: 0.05 })
      .from('.hero .section-subtitle', { y: 24, opacity: 0, duration: 0.7 }, '-=0.5')
      .from('.hero .fish-divider .icon', { x: -40, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.4')
      .from('.hero .section-intro, .hero-ctas > *', { y: 20, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, '-=0.4')
      .from('.surface-fish', { y: 60, opacity: 0, duration: 1, stagger: 0.2 }, '-=0.6');
    if (heroHead) heroHead.removeAttribute('data-reveal');
    // A backgrounded tab pauses the ticker; never leave the hero half-drawn
    setTimeout(() => { if (intro.progress() < 1) intro.progress(1); }, 5000);

    /* Waterline: slow, out-of-phase swell */
    [['.hero-wave-1', 22, 7], ['.hero-wave-2', 16, -6], ['.hero-wave-3', 12, 5]].forEach(([sel, dur, pct], i) => {
      gsap.to(sel, { xPercent: pct, duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i * 3 });
    });

    /* Light rays dim as the sunlit zone scrolls past */
    gsap.to('.light-rays', {
      opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: '.zone-sunlit', start: 'top 60%', end: 'bottom 40%', scrub: true },
    });

    /* Reveals: springy rise, staggered per group */
    document.querySelectorAll('[data-reveal-group]').forEach((group) => {
      const items = group.querySelectorAll('[data-reveal]');
      if (!items.length) return;
      gsap.set(items, { y: 44, opacity: 0 });
      ScrollTrigger.batch(items, {
        start: 'top 88%', once: true,
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.25)', stagger: 0.09, overwrite: true }),
      });
    });

    /* Fish school crosses the twilight zone with the scroll */
    gsap.utils.toArray('.school-fish').forEach((fish, i) => {
      const speed = [1, 1.3, 0.8, 1.15, 0.7, 1.05, 0.9][i % 7];
      gsap.fromTo(fish, { left: 0, x: '-30vw' }, {
        x: `${100 + 30 * speed}vw`, ease: 'none',
        scrollTrigger: { trigger: '.work', start: 'top 95%', end: 'bottom 30%', scrub: 1 + i * 0.2 },
      });
    });

    /* Huge fish shadows glide behind the content */
    gsap.utils.toArray('[data-creature]').forEach((c) => {
      const zone = c.parentElement;
      const leftward = c.classList.contains('is-flipped');
      gsap.fromTo(c, { x: leftward ? '110vw' : '-90vw' }, {
        x: leftward ? '-90vw' : '110vw', y: leftward ? -120 : 140, ease: 'none',
        scrollTrigger: { trigger: zone, start: 'top bottom', end: 'bottom top', scrub: 2 },
      });
    });

    /* Foreground kelp moves faster than the page, so you swim past it */
    gsap.utils.toArray('[data-curtain]').forEach((side) => {
      const speed = parseFloat(side.dataset.speed) || 1.5;
      gsap.fromTo(side, { y: '35vh' }, {
        y: `${-45 * speed}vh`, ease: 'none',
        scrollTrigger: { trigger: side.closest('.kelp-curtain').parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    });

    /* Work cards wobble a little on hover */
    gsap.utils.toArray('.work-card').forEach((card) => {
      card.addEventListener('mouseenter', () => gsap.to(card, { scale: 1.015, duration: 0.6, ease: 'elastic.out(1, 0.6)' }));
      card.addEventListener('mouseleave', () => gsap.to(card, { scale: 1, duration: 0.5, ease: 'power3.out' }));
    });

    /* Photo rises into place */
    const photo = document.querySelector('.about-photo');
    if (photo) {
      gsap.from(photo, { y: 50, opacity: 0, duration: 1.1, ease: 'back.out(1.4)', scrollTrigger: { trigger: photo, start: 'top 85%', once: true } });
    }
  });
})();
