// ══════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const navLink = document.querySelector('[onclick*="navigateTo(\'' + page + '\')"]');
  if (navLink && navLink.classList.contains('nav-link')) {
    navLink.classList.add('active');
  }

  const nav = document.getElementById('nav');
  if (page === 'home') {
    nav.classList.add('dark-mode');
  } else {
    nav.classList.remove('dark-mode');
  }

  setTimeout(initReveal, 100);
}

// ══════════════════════════════════════
// SCROLL BEHAVIOUR
// ══════════════════════════════════════
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// ══════════════════════════════════════
// MOBILE NAV
// ══════════════════════════════════════
function toggleMobileNav() {
  document.getElementById('mobile-nav').classList.toggle('open');
}

// ══════════════════════════════════════
// REVEAL ON SCROLL
// ══════════════════════════════════════
function initReveal() {
  const reveals = document.querySelectorAll('.page.active .reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => {
    if (!el.classList.contains('visible')) {
      observer.observe(el);
    }
  });
}

// ══════════════════════════════════════
// COUNTER ANIMATION
// ══════════════════════════════════════
function animateCounters() {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 1800;
    const start = performance.now();

    function update(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      if (target >= 1000) {
        counter.textContent = current.toLocaleString();
      } else {
        counter.textContent = current;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  });
}

const impactObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      impactObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const impactSection = document.getElementById('impact-section');
if (impactSection) impactObserver.observe(impactSection);

// ══════════════════════════════════════
// GALLERY FILTER
// ══════════════════════════════════════
function filterGallery(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    if (cat === 'all' || item.dataset.cat === cat) {
      item.style.display = '';
      item.style.opacity = '0';
      setTimeout(() => { item.style.opacity = '1'; item.style.transition = 'opacity 0.4s'; }, 10);
    } else {
      item.style.display = 'none';
    }
  });
}

// ══════════════════════════════════════
// CONTACT FORM
// ══════════════════════════════════════
function handleContactSubmit(e) {
  const btn = e.target;
  btn.textContent = '✓ Message Sent!';
  btn.style.background = '#22c55e';
  setTimeout(() => {
    btn.innerHTML = 'Send Message <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    btn.style.background = '';
  }, 3000);
}

// ══════════════════════════════════════
// INTRO VIDEO PLAYBACK
// ══════════════════════════════════════
function initIntroVideo() {
  const video = document.querySelector('.intro-video__media');
  if (video) {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.play().catch(() => {
      // Autoplay may be blocked in some browsers; muted should help.
    });
  }
}

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initIntroVideo();

  const hero = document.querySelector('.hero');
  if (hero) {
    setTimeout(initReveal, 300);
  }
});

window.addEventListener('scroll', initReveal, { passive: true });
