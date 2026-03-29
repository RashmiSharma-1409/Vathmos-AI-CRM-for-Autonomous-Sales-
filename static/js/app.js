// ══════════════════════════════════════════════════════════════════
// PipelineAI — Landing Page JavaScript
// Only handles: navbar, slider, scroll reveal, smooth scroll
// All pipeline logic lives in /static/js/dashboard.js
// ══════════════════════════════════════════════════════════════════

let sliderIndex    = 0;
let sliderInterval = null;


document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSlider();
  initScrollReveal();
  initSmoothScroll();
});


// ══════════════════════════════════════════════════════════════════
// NAVBAR — Scroll-aware header
// ══════════════════════════════════════════════════════════════════

function initNavbar() {
  const header = document.getElementById('navHeader');
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('navDrawer');

  if (!header || !burger || !drawer) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  burger.addEventListener('click', () => {
    drawer.classList.toggle('open');
    const spans = burger.querySelectorAll('span');
    if (drawer.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  drawer.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      const spans = burger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
}


// ══════════════════════════════════════════════════════════════════
// TESTIMONIAL SLIDER
// ══════════════════════════════════════════════════════════════════

function initSlider() {
  const cards = document.querySelectorAll('.slider-card');
  const dots  = document.querySelectorAll('.slider-dot');
  const prev  = document.getElementById('sliderPrev');
  const next  = document.getElementById('sliderNext');

  if (!cards.length || !prev || !next) return;

  function goToSlide(index) {
    sliderIndex = ((index % cards.length) + cards.length) % cards.length;
    cards.forEach((card, i) => {
      card.classList.remove('active');
      if (i === sliderIndex) {
        card.style.transform = 'translateX(0)';
        card.classList.add('active');
      } else if (i < sliderIndex) {
        card.style.transform = 'translateX(-40px)';
      } else {
        card.style.transform = 'translateX(40px)';
      }
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === sliderIndex);
    });
  }

  prev.addEventListener('click', () => { goToSlide(sliderIndex - 1); resetAutoSlide(); });
  next.addEventListener('click', () => { goToSlide(sliderIndex + 1); resetAutoSlide(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index));
      resetAutoSlide();
    });
  });

  function startAutoSlide() {
    sliderInterval = setInterval(() => goToSlide(sliderIndex + 1), 5000);
  }
  function resetAutoSlide() {
    clearInterval(sliderInterval);
    startAutoSlide();
  }
  startAutoSlide();
}


// ══════════════════════════════════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════════════════════════════════

function initScrollReveal() {
  const revealSelectors = [
    '.section-header',
    '.feature-card',
    '.testimonial-slider',
    '.footer-top',
    '.cta-card-inner',
  ];

  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.classList.add('reveal'));
  });

  document.querySelectorAll('.feature-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(e => observer.observe(e));
}


// ══════════════════════════════════════════════════════════════════
// SMOOTH SCROLL
// ══════════════════════════════════════════════════════════════════

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}