/* ================================================================
   PREMIUM UPGRADE JS — appended to main.js
   New: reading progress bar, image lightbox,
        magnetic buttons, scroll-to-top button
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initPremiumFeatures();
});

function initPremiumFeatures() {
  initReadingProgress();
  initMagneticButtons();
  initImageLightbox();
  initScrollTopBtn();
  initShimmerCards();
}

function initReadingProgress() {
  // Only add reading progress on writeup pages (or pages with an article)
  const article = document.querySelector("article");
  if (!article && !location.pathname.includes("/writeups/")) return;

  const progressBar = document.createElement("div");
  progressBar.id = "reading-progress";
  document.body.appendChild(progressBar);

  window.addEventListener("scroll", () => {
    // Throttle via requestAnimationFrame if needed, but simple calculations are fine
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollY / scrollHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    });
  }, { passive: true });
}

function initMagneticButtons() {
  if (window.matchMedia("(hover: none)").matches) return;

  const buttons = document.querySelectorAll(".btn");
  buttons.forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty("--btn-x", `${x}%`);
      btn.style.setProperty("--btn-y", `${y}%`);
    }, { passive: true });
  });
}

function initImageLightbox() {
  // Only on writeup pages
  const isWriteupsPage = location.pathname.includes("writeups");
  if (!isWriteupsPage) return;

  const lightbox = document.createElement("div");
  lightbox.id = "img-lightbox";
  const lightboxImg = document.createElement("img");
  lightbox.appendChild(lightboxImg);
  document.body.appendChild(lightbox);

  const images = document.querySelectorAll(".article-card img, article img, .evidence img");
  
  images.forEach(img => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden"; // Prevent scrolling
    });
  });

  lightbox.addEventListener("click", () => {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    
    // Clear src after animation to avoid flicker next time
    setTimeout(() => {
      if(!lightbox.classList.contains("open")) {
        lightboxImg.src = "";
      }
    }, 300);
  });
}

function initScrollTopBtn() {
  const btn = document.createElement("div");
  btn.id = "scroll-top-btn";
  btn.innerHTML = "↑";
  btn.title = "Back to top";
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    requestAnimationFrame(() => {
      if (window.scrollY > 400) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
      
      // Also update topbar appearance
      const topbar = document.querySelector(".topbar");
      if (topbar) {
        if (window.scrollY > 50) {
          topbar.classList.add("scrolled");
        } else {
          topbar.classList.remove("scrolled");
        }
      }
    });
  }, { passive: true });
}

function initShimmerCards() {
  // Add shimmer effect class to all cards
  const cards = document.querySelectorAll(".card, .info-card .item");
  cards.forEach(card => {
    card.classList.add("card-shimmer");
  });
}
