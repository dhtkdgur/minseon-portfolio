'use strict';

// ─── State ───────────────────────────────────────────────
const state = {
  current: 0,
  total: 11,
  isTransitioning: false,
  transitionDuration: 550
};

// ─── DOM References ──────────────────────────────────────
const slidesTrack   = document.getElementById('slidesTrack');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('slideDots');
const cntCur        = document.getElementById('cntCur');
const progressBar   = document.getElementById('progressBar');
const slides        = document.querySelectorAll('.slide');

// ─── Core Navigation ─────────────────────────────────────
function goToSlide(index) {
  if (state.isTransitioning) return;
  if (index < 0 || index >= state.total) return;
  if (index === state.current) return;

  state.isTransitioning = true;

  // Remove entered class from current slide immediately
  slides[state.current].classList.remove('slide--entered');

  state.current = index;

  // Move the track
  slidesTrack.style.transform = `translateX(calc(-100vw * ${index}))`;

  // Update UI indicators
  updateDots(index);
  updateArrows(index);
  updateSlideNumber(index);
  updateProgress(index);

  // Trigger entrance animation on the very next frame
  // so it starts in sync with the slide movement, not after
  requestAnimationFrame(() => {
    slides[index].classList.add('slide--entered');
  });

  setTimeout(() => {
    state.isTransitioning = false;
  }, state.transitionDuration);
}

function goNext() { goToSlide(state.current + 1); }
function goPrev() { goToSlide(state.current - 1); }

// ─── UI Updaters ─────────────────────────────────────────
function updateDots(index) {
  const dots = dotsContainer.querySelectorAll('.slide-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
    dot.setAttribute('aria-current', i === index ? 'true' : 'false');
  });
}

function updateArrows(index) {
  prevBtn.classList.toggle('disabled', index === 0);
  nextBtn.classList.toggle('disabled', index === state.total - 1);
  prevBtn.setAttribute('aria-disabled', index === 0 ? 'true' : 'false');
  nextBtn.setAttribute('aria-disabled', index === state.total - 1 ? 'true' : 'false');
}

function updateSlideNumber(index) {
  cntCur.textContent = String(index + 1).padStart(2, '0');
}

function updateProgress(index) {
  const pct = ((index + 1) / state.total) * 100;
  progressBar.style.width = pct + '%';
}

// ─── Event Listeners ─────────────────────────────────────

// Keyboard
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      goNext();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      goPrev();
      break;
    case 'Home':
      e.preventDefault();
      goToSlide(0);
      break;
    case 'End':
      e.preventDefault();
      goToSlide(state.total - 1);
      break;
  }
});

// Arrow buttons
prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);

// Mouse wheel with cooldown
let wheelCooldown = false;
document.addEventListener('wheel', (e) => {
  if (wheelCooldown) return;
  wheelCooldown = true;
  if (e.deltaY > 0) goNext();
  else goPrev();
  setTimeout(() => { wheelCooldown = false; }, 900);
}, { passive: true });

// Touch swipe
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dx = touchStartX - e.changedTouches[0].clientX;
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx > 0) goNext();
    else goPrev();
  }
}, { passive: true });

// ─── Initialization ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Build dot indicators
  for (let i = 0; i < state.total; i++) {
    const dot = document.createElement('button');
    dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `슬라이드 ${i + 1}로 이동`);
    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  // Set initial UI state
  updateArrows(0);
  updateSlideNumber(0);
  updateProgress(0);

  // Trigger entrance animation for first slide
  requestAnimationFrame(() => {
    setTimeout(() => {
      slides[0].classList.add('slide--entered');
    }, 80);
  });
});
