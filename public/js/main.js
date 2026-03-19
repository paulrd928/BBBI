/* BBBI Community Platform — main.js */

'use strict';

// ============================================================
// 1. NAV TOGGLE (mobile hamburger)
// ============================================================
(function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('active');
      menu.classList.remove('active');
    }
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });
})();


// ============================================================
// 2. DROPDOWN KEYBOARD NAVIGATION
// ============================================================
(function initDropdowns() {
  const dropdownParents = document.querySelectorAll('.has-dropdown');
  if (!dropdownParents.length) return;

  dropdownParents.forEach(parent => {
    const trigger = parent.querySelector('[aria-haspopup]');
    const panel   = parent.querySelector('.dropdown-panel');
    if (!trigger || !panel) return;

    // Open on Enter/Space key when trigger is focused
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = panel.classList.contains('active');
        closeAllDropdowns();
        if (!isOpen) openDropdown(trigger, panel);
      }
      if (e.key === 'Escape') closeAllDropdowns();
    });

    // Tab navigation: close when tabbing away from last link
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
        trigger.focus();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) closeAllDropdowns();
  });

  function openDropdown(trigger, panel) {
    trigger.setAttribute('aria-expanded', 'true');
    panel.classList.add('active');
  }

  function closeAllDropdowns() {
    dropdownParents.forEach(parent => {
      const t = parent.querySelector('[aria-haspopup]');
      const p = parent.querySelector('.dropdown-panel');
      if (t) t.setAttribute('aria-expanded', 'false');
      if (p) p.classList.remove('active');
    });
  }
})();


// ============================================================
// 3. CAROUSEL
// ============================================================
(function initCarousel() {
  const carousel  = document.getElementById('heroCarousel');
  if (!carousel) return;

  const slides    = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const dots      = Array.from(carousel.querySelectorAll('.carousel-dot'));
  const prevBtn   = document.getElementById('carouselPrev');
  const nextBtn   = document.getElementById('carouselNext');

  if (slides.length < 2) return;   // no carousel needed for single slide

  let current    = 0;
  let autoTimer  = null;
  const DELAY    = 6000;  // 6 s between auto-advances
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Setup initial state ---
  // Remove the CSS fallback (first-child always visible) by giving JS control
  slides.forEach((slide, i) => {
    slide.removeAttribute('hidden');  // hidden attr was used as no-JS fallback
    if (i === 0) {
      slide.classList.add('active');
    } else {
      slide.style.opacity = '0';
      slide.style.position = 'absolute';
      slide.style.inset = '0';
      slide.style.pointerEvents = 'none';
    }
  });

  function goTo(index) {
    const prev = current;
    current = (index + slides.length) % slides.length;
    if (prev === current) return;

    // Outgoing slide
    slides[prev].classList.remove('active');
    slides[prev].style.opacity = '0';
    slides[prev].style.position = 'absolute';
    slides[prev].style.pointerEvents = 'none';
    dots[prev].classList.remove('active');
    dots[prev].setAttribute('aria-selected', 'false');

    // Incoming slide
    slides[current].style.position = 'relative';
    slides[current].style.pointerEvents = 'auto';
    slides[current].classList.add('active');
    slides[current].style.opacity = '1';
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function startAuto() {
    if (REDUCED_MOTION) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), DELAY);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  // --- Controls ---
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAuto();
      goTo(current - 1);
      startAuto();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAuto();
      goTo(current + 1);
      startAuto();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAuto();
      goTo(i);
      startAuto();
    });
  });

  // Keyboard: left/right arrows when carousel is focused
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { stopAuto(); goTo(current - 1); startAuto(); }
    if (e.key === 'ArrowRight') { stopAuto(); goTo(current + 1); startAuto(); }
  });

  // Pause on hover/focus (WCAG 2.1 SC 2.2.2)
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin',    stopAuto);
  carousel.addEventListener('focusout',   startAuto);

  startAuto();
})();


// ============================================================
// 4. SMOOTH SCROLL FALLBACK
// ============================================================
if (!CSS.supports('scroll-behavior', 'smooth')) {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#main') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
