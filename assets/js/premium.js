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
  if (document.body.dataset.pageKind !== "article") return;

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
  if (document.body.dataset.visualStyle === "editorial" || window.matchMedia("(hover: none)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
  const images = document.querySelectorAll('body[data-page-kind="article"] main img, .case-content .project-screen img');
  if (!images.length) return;
  const lightbox = document.createElement('dialog');
  lightbox.id = 'img-lightbox';
  lightbox.setAttribute('aria-label', 'Evidence image preview');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'lightbox-close';
  close.textContent = 'Close preview ×';
  const image = document.createElement('img');
  const caption = document.createElement('p');
  caption.className = 'lightbox-caption';
  lightbox.append(close, image, caption);
  document.body.append(lightbox);
  let previousOverflow = '';
  let sourceImage = null;
  images.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');
    img.addEventListener('click', () => {
      sourceImage = img;
      image.src = img.currentSrc || img.src;
      image.alt = img.alt || 'Evidence image';
      caption.textContent = img.closest('figure')?.querySelector('figcaption')?.textContent || image.alt;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      lightbox.showModal();
      close.focus();
    });
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        img.click();
      }
    });
  });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'Tab') { event.preventDefault(); close.focus(); }
  });
  close.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    sourceImage?.focus({preventScroll: true});
    image.removeAttribute('src');
  });
}

function initScrollTopBtn() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "scroll-top-btn";
  btn.innerHTML = "↑";
  btn.title = "Back to top";
  btn.setAttribute("aria-label", "Back to top");
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
