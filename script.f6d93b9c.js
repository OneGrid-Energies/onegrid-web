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
  updateBackgroundVideo(page);
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
// GALLERY LIGHTBOX
// ══════════════════════════════════════
let galleryLightboxTrigger = null;

function getGalleryCaption(item) {
  const label = item.querySelector('.gallery-overlay span')?.textContent.trim();
  if (label) return label;

  const labels = {
    oneplastic: 'OnePlastic',
    onehealth: 'OneHealth',
    onebox: 'OneBox',
    solar: 'Solar Installation',
    training: 'Training Academy',
    'office+workshop': 'Office / Workshop'
  };
  return labels[item.dataset.cat] || 'OneGrid Energies';
}

function openGalleryLightbox(item) {
  const modal = document.getElementById('gallery-lightbox');
  const image = document.getElementById('gallery-lightbox-image');
  const caption = document.getElementById('gallery-lightbox-title');
  const source = item.dataset.image;
  if (!modal || !image || !caption || !source || source.includes('example.com')) return;

  const label = getGalleryCaption(item);
  image.src = cloudinaryUrl(source, { width: 1600, quality: 'auto:good' });
  image.alt = label;
  caption.textContent = label;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  galleryLightboxTrigger = item;
  modal.querySelector('.gallery-lightbox__close')?.focus();
}

function closeGalleryLightbox() {
  const modal = document.getElementById('gallery-lightbox');
  const image = document.getElementById('gallery-lightbox-image');
  if (!modal || !image) return;

  modal.hidden = true;
  image.removeAttribute('src');
  image.alt = '';
  document.body.style.overflow = '';
  galleryLightboxTrigger?.focus();
  galleryLightboxTrigger = null;
}

function initGalleryLightbox() {
  const modal = document.getElementById('gallery-lightbox');
  if (!modal) return;

  document.querySelectorAll('.gallery-item[data-image]').forEach(item => {
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View ${getGalleryCaption(item)} image`);
    item.addEventListener('click', () => openGalleryLightbox(item));
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openGalleryLightbox(item);
      }
    });
  });

  modal.querySelectorAll('[data-gallery-lightbox-close]').forEach(el => {
    el.addEventListener('click', closeGalleryLightbox);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) closeGalleryLightbox();
  });
}

// ══════════════════════════════════════
// INTRO VIDEO PLAYBACK
// ══════════════════════════════════════
const BACKGROUND_VIDEOS = {
  home: {
    src: 'https://res.cloudinary.com/dj2ciluyx/video/upload/v1781117070/Background_video_1_nwdtxu.mp4',
    poster: 'https://res.cloudinary.com/dj2ciluyx/video/upload/so_0,q_auto:low,w_800,c_limit/v1781117070/Background_video_1_nwdtxu.jpg',
    label: 'OneGrid Energies',
    title: 'A brighter future starts with one loop of light.',
    subtitle: 'This muted video section plays in a continuous loop before you continue down the page to the rest of the OneGrid story.',
    target: '.hero'
  },
  about: {
    src: 'https://res.cloudinary.com/dj2ciluyx/video/upload/v1781116924/Background_video_3_jshjf7.mp4',
    poster: 'https://res.cloudinary.com/dj2ciluyx/video/upload/so_0,q_auto:low,w_800,c_limit/v1781116924/Background_video_3_jshjf7.jpg',
    label: 'Our Story',
    title: 'Small innovations can create big change.',
    subtitle: 'Background Video 3 opens the About story before you continue into OneGrid Energies, its journey, and its mission.',
    target: '#page-about .page-hero'
  },
  oneplastic: {
    src: 'https://res.cloudinary.com/dj2ciluyx/video/upload/v1782152748/MP4_Background_video_2_p7wmtx.mp4',
    poster: 'https://res.cloudinary.com/dj2ciluyx/video/upload/so_0,q_auto:low,w_800,c_limit/v1782152748/MP4_Background_video_2_p7wmtx.jpg',
    label: 'OnePlastic Initiative',
    title: 'Waste becomes light before the story begins.',
    subtitle: 'Background Video 2 introduces the OnePlastic journey before you continue into the initiative, its model, and its community impact.',
    target: '#page-oneplastic .page-hero'
  },
  stories: {
    src: 'https://res.cloudinary.com/dj2ciluyx/video/upload/v1781117070/Background_video_1_nwdtxu.mp4',
    poster: 'https://res.cloudinary.com/dj2ciluyx/video/upload/so_0,q_auto:low,w_800,c_limit/v1781117070/Background_video_1_nwdtxu.jpg',
    label: 'Stories of Hope',
    title: 'Every light carries a human story.',
    subtitle: 'This shared intro video opens the Stories of Hope page before you continue into the people and communities behind OneGrid Energies.',
    target: '#page-stories'
  },
  contact: {
    src: 'https://res.cloudinary.com/dj2ciluyx/video/upload/v1781117070/Background_video_1_nwdtxu.mp4',
    poster: 'https://res.cloudinary.com/dj2ciluyx/video/upload/so_0,q_auto:low,w_800,c_limit/v1781117070/Background_video_1_nwdtxu.jpg',
    label: 'Contact OneGrid',
    title: 'Start a partnership that reduces darkness.',
    subtitle: 'This shared intro video opens the Contact page before you continue to partnership, investment, donation, and media enquiries.',
    target: '#page-contact .page-hero'
  }
};

function updateIntroContent(config) {
  const label = document.querySelector('[data-intro-label]');
  const title = document.querySelector('[data-intro-title]');
  const subtitle = document.querySelector('[data-intro-subtitle]');
  const cta = document.querySelector('[data-intro-cta]');

  if (label) label.textContent = config.label;
  if (title) title.textContent = config.title;
  if (subtitle) subtitle.textContent = config.subtitle;
  if (cta) cta.dataset.introTarget = config.target;
}

function scrollIntroTarget() {
  const cta = document.querySelector('[data-intro-cta]');
  const selector = cta?.dataset.introTarget || '.page.active';
  const target = document.querySelector(selector);
  if (target) target.scrollIntoView({ behavior: 'smooth' });
}

function playBackgroundVideo(video) {
  if (!video) return;

  const tier = getConnectionTier();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (tier === 'save' || tier === 'slow' || prefersReducedMotion) return;

  video.play().catch(() => {});
}

function getOptimizedVideoSrc(baseSrc) {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const width = isMobile ? 720 : 1280;
  return baseSrc.includes('cloudinary.com') ? cloudinaryVideoUrl(baseSrc, { width }) : baseSrc;
}

function setSharedVideoSource(video, config) {
  const source = video.querySelector('source');
  if (!source) return;

  if (source.getAttribute('data-base') !== config.src) {
    source.setAttribute('data-base', config.src);
    source.src = getOptimizedVideoSrc(config.src);
    video.poster = config.poster;
    video.load();
  }
}

function updateBackgroundVideo(page) {
  const video = document.getElementById('shared-bg-video');
  const introSection = document.querySelector('.intro-video');
  const introWrapper = document.querySelector('.intro-video__wrapper');
  if (!video || !introSection || !introWrapper) return;

  if (BACKGROUND_VIDEOS[page]) {
    introSection.hidden = false;
    updateIntroContent(BACKGROUND_VIDEOS[page]);
    setSharedVideoSource(video, BACKGROUND_VIDEOS[page]);
    introWrapper.prepend(video);
    playBackgroundVideo(video);
    return;
  }

  introSection.hidden = true;
  video.pause();
  introWrapper.prepend(video);
}

function initIntroVideo() {
  const video = document.getElementById('shared-bg-video');
  if (!video || video.dataset.initialized === 'true') return;

  const tier = getConnectionTier();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = tier === 'save' || tier === 'slow' ? 'none' : 'metadata';

  const source = video.querySelector('source');
  if (source) {
    const baseSrc = source.getAttribute('data-base') || source.src;
    source.setAttribute('data-base', baseSrc);
    source.src = getOptimizedVideoSrc(baseSrc);
  }

  if (tier === 'save' || tier === 'slow' || prefersReducedMotion) {
    video.removeAttribute('autoplay');
  } else {
    video.autoplay = true;
  }

  video.dataset.initialized = 'true';
  updateBackgroundVideo('home');
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
          const optimized = cloudinaryUrl(logoUrl, { width: 320, height: 152, crop: 'limit' });
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
// SERVICE VIDEO MODAL (What We Do)
// ══════════════════════════════════════
function getYouTubeId(spec) {
  if (!spec) return '';
  if (spec.startsWith('youtube:')) return spec.slice('youtube:'.length);

  try {
    const url = new URL(spec);
    if (url.hostname.includes('youtu.be')) return url.pathname.replace('/', '');
    if (url.hostname.includes('youtube.com')) {
      if (url.searchParams.get('v')) return url.searchParams.get('v');
      const embedMatch = url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
    }
  } catch (e) {
    return spec.includes(':') ? '' : spec;
  }

  return '';
}

function buildServiceVideoEmbed(spec) {
  const youtubeId = getYouTubeId(spec);
  if (youtubeId) {
    const src = `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0`;
    return `<iframe src="${src}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }

  const [type, id] = spec.split(':');
  if (type === 'instagram' && id) {
    const src = `https://www.instagram.com/reel/${encodeURIComponent(id)}/embed`;
    return `<iframe src="${src}" title="Instagram reel" allowfullscreen scrolling="no"></iframe>`;
  }
  return '';
}

function initStoryVideoThumbnails() {
  document.querySelectorAll('.story-video-card__media[data-service-video]').forEach(trigger => {
    const youtubeId = getYouTubeId(trigger.dataset.serviceVideo);
    if (!youtubeId) return;

    const thumbnail = `https://img.youtube.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg`;
    trigger.style.backgroundImage = `linear-gradient(180deg, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.82) 100%), url('${thumbnail}')`;
    trigger.style.backgroundSize = 'cover';
    trigger.style.backgroundPosition = 'center';
    trigger.classList.add('has-youtube-thumbnail');
  });
}

function openServiceVideoModal(spec) {
  const modal = document.getElementById('service-video-modal');
  const embedHost = document.getElementById('service-video-modal-embed');
  if (!modal || !embedHost) return;

  const html = buildServiceVideoEmbed(spec);
  if (!html) return;

  embedHost.innerHTML = html;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('.service-video-modal__close')?.focus();
}

function closeServiceVideoModal() {
  const modal = document.getElementById('service-video-modal');
  const embedHost = document.getElementById('service-video-modal-embed');
  if (!modal || !embedHost) return;

  modal.hidden = true;
  embedHost.innerHTML = '';
  document.body.style.overflow = '';
}

function initServiceVideos() {
  const modal = document.getElementById('service-video-modal');
  if (!modal) return;

  initStoryVideoThumbnails();

  document.querySelectorAll('[data-service-video]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      openServiceVideoModal(trigger.dataset.serviceVideo);
    });
  });

  modal.querySelectorAll('[data-service-video-close]').forEach(el => {
    el.addEventListener('click', closeServiceVideoModal);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeServiceVideoModal();
  });
}

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLazyImages();
  initGalleryImages();
  initGalleryLightbox();
  initPartnerLogos();
  initReveal();
  initIntroVideo();
  initServiceVideos();

  const hero = document.querySelector('.hero');
  if (hero) {
    setTimeout(initReveal, 300);
  }
});



window.addEventListener('scroll', initReveal, { passive: true });
