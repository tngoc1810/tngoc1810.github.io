document.addEventListener("DOMContentLoaded", () => {
  initCyberBackground();
  setupFilters();
  initTocActiveHighlight();
});

/* =========================================================
   LIGHT CYBER BACKGROUND
   Optimized animated canvas background for smoother scrolling.
   ========================================================= */

function initCyberBackground() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    removeOldBackgrounds();
    return;
  }

  removeOldBackgrounds();

  const canvas = document.createElement("canvas");
  canvas.id = "network-bg";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let lastFrame = 0;
  let isScrolling = false;
  let scrollTimer = null;
  let isArticlePage = Boolean(document.querySelector(".article-layout"));

  const fps = isArticlePage ? 18 : 24;
  const frameInterval = 1000 / fps;

  function removeCanvasOnMobile() {
    if (window.innerWidth <= 760) {
      canvas.remove();
      return true;
    }

    return false;
  }

  if (removeCanvasOnMobile()) return;

  function setScrolling() {
    isScrolling = true;

    clearTimeout(scrollTimer);

    scrollTimer = setTimeout(() => {
      isScrolling = false;
    }, 180);
  }

  window.addEventListener("scroll", setScrolling, { passive: true });
  window.addEventListener("wheel", setScrolling, { passive: true });
  window.addEventListener("touchmove", setScrolling, { passive: true });

  function getParticleCount() {
    if (isArticlePage) {
      if (width < 900) return 10;
      if (width < 1300) return 14;
      return 18;
    }

    if (width < 700) return 12;
    if (width < 1100) return 20;
    return 28;
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    if (width <= 760) {
      canvas.remove();
      return;
    }

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createParticles();
  }

  function createParticles() {
    const count = getParticleCount();

    particles = Array.from({ length: count }, () => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.5 + 0.9,
        alpha: Math.random() * 0.22 + 0.18
      };
    });
  }

  function drawGlow(time) {
    const t = time * 0.00016;

    const cx = width * 0.55 + Math.sin(t) * 18;
    const cy = height * 0.42 + Math.cos(t * 0.9) * 12;

    const radius = Math.min(width, height) * 0.48;

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    glow.addColorStop(0, "rgba(90, 220, 255, 0.11)");
    glow.addColorStop(0.35, "rgba(45, 140, 255, 0.065)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    if (isScrolling || isArticlePage) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.000045);

    const rings = [130, 220, 320];

    for (const ring of rings) {
      ctx.beginPath();
      ctx.arc(0, 0, ring, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100, 225, 255, 0.045)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 320, Math.sin(angle) * 320);
      ctx.strokeStyle = "rgba(100, 225, 255, 0.025)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  function updateParticles() {
    const speed = isScrolling ? 0.25 : 1;

    for (const p of particles) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    }
  }

  function drawParticles() {
    const maxDistance = isArticlePage ? 85 : 115;
    const maxDistanceSq = maxDistance * maxDistance;

    if (!isScrolling) {
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistanceSq) {
            const distance = Math.sqrt(distSq);
            const opacity = (1 - distance / maxDistance) * (isArticlePage ? 0.08 : 0.14);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(80, 220, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(130, 240, 255, ${p.alpha})`;
      ctx.fill();
    }
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;

    ctx.clearRect(0, 0, width, height);

    drawGlow(time);
    updateParticles();
    drawParticles();
  }

  function loop(time) {
    if (!lastFrame || time - lastFrame >= frameInterval) {
      lastFrame = time;
      render(time);
    }

    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", debounce(resizeCanvas, 160), { passive: true });

  resizeCanvas();
  requestAnimationFrame(loop);
}

function removeOldBackgrounds() {
  const selectors = [
    "#site-bg",
    "#network-bg",
    ".bg-orb",
    ".bg-radar",
    ".bg-sweep",
    ".bg-stars"
  ];

  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((element) => {
      element.remove();
    });
  }
}

/* =========================================================
   WRITEUP / CARD FILTERS
   Used on writeups page.
   ========================================================= */

function setupFilters() {
  const chips = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const searchInput = document.querySelector("[data-search]");
  const emptyState = document.querySelector("[data-empty]");

  if (!chips.length || !cards.length) return;

  function getActiveFilter() {
    const activeChip = document.querySelector("[data-filter].active");
    return activeChip ? activeChip.dataset.filter : "all";
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter() {
    const activeFilter = normalize(getActiveFilter());
    const keyword = normalize(searchInput ? searchInput.value : "");

    let visibleCount = 0;

    for (const card of cards) {
      const category = normalize(card.dataset.category);
      const text = normalize(card.dataset.text || card.textContent);

      const categoryMatch = activeFilter === "all" || category.includes(activeFilter);
      const textMatch = !keyword || text.includes(keyword);

      if (categoryMatch && textMatch) {
        card.classList.remove("hidden");
        visibleCount++;
      } else {
        card.classList.add("hidden");
      }
    }

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      for (const item of chips) {
        item.classList.remove("active");
      }

      chip.classList.add("active");
      applyFilter();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", debounce(applyFilter, 80));
  }

  applyFilter();
}

/* =========================================================
   TOC ACTIVE SECTION HIGHLIGHT
   Highlights current section while reading writeups.
   ========================================================= */

function initTocActiveHighlight() {
  const tocLinks = Array.from(document.querySelectorAll(".toc a[href^='#']"));

  if (!tocLinks.length) return;

  const sections = tocLinks
    .map((link) => {
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);

      if (!target) return null;

      return {
        link,
        target
      };
    })
    .filter(Boolean);

  if (!sections.length) return;

  function setActiveToc() {
    const offset = 120;
    let current = sections[0];

    for (const item of sections) {
      const rect = item.target.getBoundingClientRect();

      if (rect.top <= offset) {
        current = item;
      } else {
        break;
      }
    }

    for (const link of tocLinks) {
      link.classList.remove("active");
    }

    current.link.classList.add("active");
  }

  setActiveToc();

  window.addEventListener("scroll", throttle(setActiveToc, 80), { passive: true });
  window.addEventListener("resize", debounce(setActiveToc, 120), { passive: true });
}

/* =========================================================
   OPTIONAL CODE COPY BUTTON SUPPORT
   Works if your HTML has buttons with onclick="copyCode(this)".
   ========================================================= */

function copyCode(button) {
  const wrapper = button.closest(".code-block-wrapper");
  const code = wrapper ? wrapper.querySelector("pre code") : null;

  if (!code) return;

  const text = code.innerText;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      const oldText = button.textContent;
      button.textContent = "Copied";
      button.classList.add("copied");

      setTimeout(() => {
        button.textContent = oldText || "Copy";
        button.classList.remove("copied");
      }, 1200);
    })
    .catch(() => {
      button.textContent = "Failed";

      setTimeout(() => {
        button.textContent = "Copy";
      }, 1200);
    });
}

window.copyCode = copyCode;

/* =========================================================
   UTILITIES
   ========================================================= */

function debounce(fn, wait = 100) {
  let timer = null;

  return function debounced(...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

function throttle(fn, wait = 100) {
  let lastTime = 0;
  let timer = null;

  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0) {
      clearTimeout(timer);
      timer = null;
      lastTime = now;
      fn.apply(this, args);
      return;
    }

    if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
