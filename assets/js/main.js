document.addEventListener("DOMContentLoaded", () => {
  initCyberBackground();
  setupFilters();
  initTocActiveHighlight();
});

/* =========================================================
   PREMIUM CYBER BACKGROUND
   Canvas-only, FPS capped, disabled on small screens and reduced motion.
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
  let streams = [];
  let pulses = [];
  let lastFrame = 0;
  let isScrolling = false;
  let scrollTimer = null;
  const isArticlePage = Boolean(document.querySelector(".article-layout"));
  const fps = isArticlePage ? 20 : 28;
  const frameInterval = 1000 / fps;

  function shouldDisableCanvas() {
    return window.innerWidth <= 760;
  }

  if (shouldDisableCanvas()) return;

  function setScrolling() {
    isScrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      isScrolling = false;
    }, 160);
  }

  window.addEventListener("scroll", setScrolling, { passive: true });
  window.addEventListener("wheel", setScrolling, { passive: true });
  window.addEventListener("touchmove", setScrolling, { passive: true });

  function particleCount() {
    if (isArticlePage) {
      if (width < 1000) return 16;
      return 22;
    }
    if (width < 1000) return 24;
    if (width < 1500) return 34;
    return 42;
  }

  function streamCount() {
    if (isArticlePage) return 4;
    if (width < 1000) return 5;
    return 7;
  }

  function resizeCanvas() {
    if (shouldDisableCanvas()) {
      canvas.remove();
      return;
    }

    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.35);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createScene();
  }

  function createScene() {
    const count = particleCount();
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.45 + 0.75,
      alpha: Math.random() * 0.24 + 0.18,
      phase: Math.random() * Math.PI * 2,
      group: index % 3
    }));

    streams = Array.from({ length: streamCount() }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 180 + 150,
      speed: Math.random() * 0.42 + 0.22,
      alpha: Math.random() * 0.08 + 0.035,
      angle: -0.58 + Math.random() * 0.18
    }));

    pulses = Array.from({ length: isArticlePage ? 1 : 2 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      t: Math.random() * 1000,
      speed: Math.random() * 0.55 + 0.35,
      max: Math.min(width, height) * (Math.random() * 0.18 + 0.22)
    }));
  }

  function drawAurora(time) {
    const t = time * 0.00018;
    const x1 = width * (0.25 + Math.sin(t) * 0.045);
    const y1 = height * (0.25 + Math.cos(t * 1.15) * 0.035);
    const x2 = width * (0.78 + Math.cos(t * 0.9) * 0.045);
    const y2 = height * (0.18 + Math.sin(t * 1.1) * 0.04);
    const x3 = width * (0.56 + Math.sin(t * 0.7) * 0.04);
    const y3 = height * (0.78 + Math.cos(t * 0.8) * 0.035);

    for (const orb of [
      [x1, y1, Math.min(width, height) * 0.55, "rgba(124, 240, 255, 0.10)", "rgba(45, 140, 255, 0.02)"],
      [x2, y2, Math.min(width, height) * 0.50, "rgba(45, 140, 255, 0.11)", "rgba(124, 240, 255, 0.015)"],
      [x3, y3, Math.min(width, height) * 0.58, "rgba(45, 212, 191, 0.07)", "rgba(0, 0, 0, 0)"]
    ]) {
      const [x, y, radius, inner, outer] = orb;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, inner);
      gradient.addColorStop(0.48, outer);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawGrid(time) {
    if (isScrolling) return;

    const gap = 64;
    const drift = (time * 0.012) % gap;
    ctx.save();
    ctx.globalAlpha = isArticlePage ? 0.10 : 0.16;
    ctx.strokeStyle = "rgba(124, 240, 255, 0.16)";
    ctx.lineWidth = 1;

    for (let x = -gap + drift; x < width + gap; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height * 0.16, height);
      ctx.stroke();
    }

    for (let y = -gap + drift; y < height + gap; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y - width * 0.08);
      ctx.stroke();
    }

    ctx.restore();
  }

  function updateParticles() {
    const speed = isScrolling ? 0.18 : 1;
    for (const p of particles) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      p.phase += 0.012 * speed;
      if (p.x < -24) p.x = width + 24;
      if (p.x > width + 24) p.x = -24;
      if (p.y < -24) p.y = height + 24;
      if (p.y > height + 24) p.y = -24;
    }
  }

  function drawParticles() {
    const maxDistance = isArticlePage ? 92 : 132;
    const maxDistanceSq = maxDistance * maxDistance;

    if (!isScrolling) {
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (a.group !== b.group && Math.random() > 0.35) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistanceSq) {
            const distance = Math.sqrt(distSq);
            const opacity = (1 - distance / maxDistance) * (isArticlePage ? 0.09 : 0.17);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(90, 225, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    for (const p of particles) {
      const pulse = Math.sin(p.phase) * 0.25 + 0.75;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 245, 255, ${p.alpha})`;
      ctx.fill();
    }
  }

  function drawStreams() {
    if (isScrolling || isArticlePage) return;

    ctx.save();
    ctx.lineCap = "round";
    for (const s of streams) {
      const dx = Math.cos(s.angle) * s.len;
      const dy = Math.sin(s.angle) * s.len;
      const gradient = ctx.createLinearGradient(s.x, s.y, s.x + dx, s.y + dy);
      gradient.addColorStop(0, "rgba(124, 240, 255, 0)");
      gradient.addColorStop(0.5, `rgba(124, 240, 255, ${s.alpha})`);
      gradient.addColorStop(1, "rgba(45, 140, 255, 0)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + dx, s.y + dy);
      ctx.stroke();

      s.x += s.speed;
      s.y -= s.speed * 0.55;
      if (s.x > width + s.len || s.y < -s.len) {
        s.x = -s.len;
        s.y = Math.random() * height + height * 0.2;
      }
    }
    ctx.restore();
  }

  function drawPulses() {
    if (isScrolling) return;

    ctx.save();
    for (const pulse of pulses) {
      pulse.t += pulse.speed;
      const radius = pulse.t % pulse.max;
      const opacity = Math.max(0, 1 - radius / pulse.max) * (isArticlePage ? 0.08 : 0.12);
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(124, 240, 255, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (radius > pulse.max - 2) {
        pulse.x = Math.random() * width;
        pulse.y = Math.random() * height;
      }
    }
    ctx.restore();
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);
    drawAurora(time);
    drawGrid(time);
    drawStreams();
    drawPulses();
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
  const selectors = ["#site-bg", "#network-bg", ".bg-orb", ".bg-radar", ".bg-sweep", ".bg-stars"];
  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((element) => element.remove());
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

    if (emptyState) emptyState.style.display = visibleCount === 0 ? "block" : "none";
  }

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      for (const item of chips) item.classList.remove("active");
      chip.classList.add("active");
      applyFilter();
    });
  }

  if (searchInput) searchInput.addEventListener("input", debounce(applyFilter, 80));
  applyFilter();
}

/* =========================================================
   TOC ACTIVE SECTION HIGHLIGHT
   Highlights current section while reading writeups.
   ========================================================= */

function initTocActiveHighlight() {
  const tocLinks = Array.from(document.querySelectorAll(".toc a[href^='#']"));
  if (!tocLinks.length) return;

  const sections = tocLinks.map((link) => {
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return null;
    return { link, target };
  }).filter(Boolean);

  if (!sections.length) return;

  function setActiveToc() {
    const offset = 120;
    let current = sections[0];

    for (const item of sections) {
      const rect = item.target.getBoundingClientRect();
      if (rect.top <= offset) current = item;
      else break;
    }

    for (const link of tocLinks) link.classList.remove("active");
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
  navigator.clipboard.writeText(text).then(() => {
    const oldText = button.textContent;
    button.textContent = "Copied";
    button.classList.add("copied");
    setTimeout(() => {
      button.textContent = oldText || "Copy";
      button.classList.remove("copied");
    }, 1200);
  }).catch(() => {
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
    timer = setTimeout(() => fn.apply(this, args), wait);
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
