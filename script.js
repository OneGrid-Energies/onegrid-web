const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#siteNav");
const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("main section[id]");
const yearEl = document.querySelector("#year");
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const themeToggle = document.querySelector("#themeToggle");
const slides = document.querySelectorAll(".slide");
const slideDots = document.querySelector("#slideDots");
const prevSlide = document.querySelector("#prevSlide");
const nextSlide = document.querySelector("#nextSlide");
let slideIndex = 0;
let slideTimer;

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const setTheme = (theme) => {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
  localStorage.setItem("onegrid-theme", theme);
};

const initialTheme = localStorage.getItem("onegrid-theme") || "light";
setTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    setTheme(nextTheme);
  });
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
    const expanded = siteNav.classList.contains("open");
    menuToggle.setAttribute("aria-expanded", String(expanded));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (siteNav.classList.contains("open")) {
      siteNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

const setActiveLink = () => {
  let currentId = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentId}`) {
      link.classList.add("active");
    }
  });
};

window.addEventListener("scroll", setActiveLink);
setActiveLink();

const pauseAllVideos = () => {
  slides.forEach((slide) => {
    const video = slide.querySelector("video");
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  });
};

const renderDots = () => {
  if (!slideDots) {
    return;
  }
  slideDots.innerHTML = "";
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "slide-dot";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    slideDots.appendChild(dot);
  });
};

const updateSlides = () => {
  const dots = document.querySelectorAll(".slide-dot");
  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === slideIndex);
  });
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === slideIndex);
  });

  pauseAllVideos();
  const currentVideo = slides[slideIndex]?.querySelector("video");
  if (currentVideo) {
    currentVideo.play().catch(() => null);
  }
};

const goToSlide = (index) => {
  slideIndex = (index + slides.length) % slides.length;
  updateSlides();
};

const startSlideshow = () => {
  if (slides.length < 2) {
    return;
  }
  slideTimer = setInterval(() => {
    goToSlide(slideIndex + 1);
  }, 5000);
};

if (slides.length) {
  renderDots();
  updateSlides();
  startSlideshow();

  prevSlide?.addEventListener("click", () => {
    clearInterval(slideTimer);
    goToSlide(slideIndex - 1);
    startSlideshow();
  });

  nextSlide?.addEventListener("click", () => {
    clearInterval(slideTimer);
    goToSlide(slideIndex + 1);
    startSlideshow();
  });
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "Thank you. Your message has been received.";
    formStatus.style.color = "#2b7a0b";
    contactForm.reset();
  });
}
