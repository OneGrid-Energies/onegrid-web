// ══════════════════════════════════════
// CLOUDINARY HELPERS
// ══════════════════════════════════════
function cloudinaryUrl(url, options = {}) {
  if (!url || !url.includes('res.cloudinary.com') || url.includes('example.com')) {
    return url;
  }
  const { width, height, quality = 'auto', format = 'auto', crop } = options;
  const transforms = [`f_${format}`, `q_${quality}`];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}

function cloudinaryVideoUrl(url, options = {}) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const { width = 1280, quality = 'auto:eco' } = options;
  return url.replace('/upload/', `/upload/q_${quality},w_${width},c_limit,f_mp4/`);
}

function getGalleryImageWidth(item) {
  const viewport = window.innerWidth;
  if (viewport <= 480) return 480;
  if (viewport <= 768) return item.classList.contains('wide') ? 768 : 400;
  if (item.classList.contains('wide') || item.classList.contains('tall')) return 800;
  return 400;
}

function getConnectionTier() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return 'normal';
  if (conn.saveData) return 'save';
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return 'slow';
  return 'normal';
}

// ══════════════════════════════════════
// THEME
// ══════════════════════════════════════
const THEME_KEY = 'onegrid-theme';

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0A0A0A' : '#FFD400';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  applyTheme(getPreferredTheme());
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}

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
}, { passive: true });

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
  if (!video) return;

  const source = video.querySelector('source');
  const tier = getConnectionTier();
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (source && source.src.includes('cloudinary.com')) {
    const width = isMobile ? 720 : 1280;
    source.src = cloudinaryVideoUrl(source.src, { width });
  }

  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = tier === 'save' || tier === 'slow' ? 'none' : 'metadata';

  if (tier === 'save' || tier === 'slow' || prefersReducedMotion) {
    video.removeAttribute('autoplay');
    return;
  }

  video.autoplay = true;
  video.play().catch(() => {});
}

// ══════════════════════════════════════
// LAZY IMAGE LOADING
// ══════════════════════════════════════
function loadBackgroundImage(el, url, width) {
  if (!url || el.dataset.loaded === 'true') return;
  const optimized = cloudinaryUrl(url, { width, crop: 'fill' });
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    el.style.backgroundImage = `url('${optimized}')`;
    el.classList.remove('is-loading');
    el.classList.add('is-loaded');
    el.dataset.loaded = 'true';
  };
  img.onerror = () => {
    el.classList.remove('is-loading');
  };
  img.src = optimized;
}

function initLazyImages() {
  const founderImg = document.querySelector('.story-founder-img-wrap img[data-src]');
  if (founderImg) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.getAttribute('data-src');
        img.src = cloudinaryUrl(src, { width: 640, crop: 'fill' });
        img.srcset = [
          `${cloudinaryUrl(src, { width: 400, crop: 'fill' })} 400w`,
          `${cloudinaryUrl(src, { width: 640, crop: 'fill' })} 640w`,
          `${cloudinaryUrl(src, { width: 900, crop: 'fill' })} 900w`
        ].join(', ');
        img.sizes = '(max-width: 768px) 100vw, 420px';
        img.removeAttribute('data-src');
        obs.unobserve(img);
      });
    }, { rootMargin: '200px' });
    observer.observe(founderImg);
  }

  const visionBg = document.querySelector('.vision-bg[data-bg]');
  if (visionBg) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const url = entry.target.getAttribute('data-bg');
        const optimized = cloudinaryUrl(url, { width: 1600, quality: 'auto:good' });
        entry.target.style.background = `linear-gradient(180deg, rgba(12,11,8,0.65), rgba(12,11,8,0.92)), url('${optimized}') center/cover no-repeat`;
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '100px' });
    observer.observe(visionBg);
  }
}

function initGalleryImages() {
  const galleryItems = document.querySelectorAll('.gallery-item[data-image]');
  if (!galleryItems.length) return;

  galleryItems.forEach(item => item.classList.add('is-loading'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      const imageUrl = item.getAttribute('data-image');
      const width = getGalleryImageWidth(item);
      loadBackgroundImage(item, imageUrl, width);
      observer.unobserve(item);
    });
  }, { rootMargin: '150px', threshold: 0.01 });

  galleryItems.forEach(item => observer.observe(item));
}

function initPartnerLogos() {
  const track = document.getElementById('partners-track');
  if (!track) return;

  Array.from(track.children).forEach(card => {
    track.appendChild(card.cloneNode(true));
  });

  const partnersSection = document.querySelector('.partners-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const cards = partnersSection.querySelectorAll('.partner-card[data-logo]');
      const byUrl = new Map();
      cards.forEach(card => {
        const url = card.getAttribute('data-logo');
        if (!byUrl.has(url)) byUrl.set(url, []);
        byUrl.get(url).push(card);
      });

      let delay = 0;
      byUrl.forEach((cardGroup, logoUrl) => {
        setTimeout(() => {
          const optimized = cloudinaryUrl(logoUrl, { width: 248, height: 112, crop: 'limit' });
          const preload = new Image();
          preload.onload = () => {
            cardGroup.forEach(card => {
              const img = card.querySelector('.partner-card__img');
              if (img) img.src = optimized;
              card.classList.remove('is-loading');
              card.dataset.loaded = 'true';
            });
          };
          preload.onerror = () => {
            cardGroup.forEach(card => card.classList.remove('is-loading'));
          };
          preload.src = optimized;
        }, delay);
        delay += 30;
      });

      observer.unobserve(entry.target);
    });
  }, { rootMargin: '200px' });

  observer.observe(partnersSection);
}

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLazyImages();
  initGalleryImages();
  initPartnerLogos();
  initReveal();
  initIntroVideo();

  const hero = document.querySelector('.hero');
  if (hero) {
    setTimeout(initReveal, 300);
  }
});



window.addEventListener('scroll', initReveal, { passive: true });
