document.addEventListener("DOMContentLoaded", () => {
  initCyberBackground();
  setupFilters();
  initTocActiveHighlight();
});

/* =========================================================
   CINEMATIC CYBER MESH BACKGROUND
   Smooth canvas animation: aurora ribbons, node mesh, scanlines, and stars.
   No libraries. FPS capped. Disabled on mobile/reduced-motion.
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
  let nodes = [];
  let stars = [];
  let streaks = [];
  let lastFrame = 0;
  let isScrolling = false;
  let scrollTimer = null;
  const isArticlePage = Boolean(document.querySelector(".article-layout"));
  const fps = isArticlePage ? 20 : 30;
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
    }, 150);
  }

  window.addEventListener("scroll", setScrolling, { passive: true });
  window.addEventListener("wheel", setScrolling, { passive: true });
  window.addEventListener("touchmove", setScrolling, { passive: true });

  function resizeCanvas() {
    if (shouldDisableCanvas()) {
      canvas.remove();
      return;
    }

    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.3);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createScene();
  }

  function createScene() {
    const nodeCount = isArticlePage ? 18 : width < 1200 ? 32 : 44;
    const starCount = isArticlePage ? 34 : width < 1200 ? 55 : 78;
    const streakCount = isArticlePage ? 3 : 5;

    nodes = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.12,
      r: Math.random() * 1.6 + 0.75,
      phase: Math.random() * Math.PI * 2,
      hue: i % 4
    }));

    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.15 + 0.25,
      a: Math.random() * 0.28 + 0.08,
      twinkle: Math.random() * Math.PI * 2
    }));

    streaks = Array.from({ length: streakCount }, () => createStreak(true));
  }

  function createStreak(randomize = false) {
    return {
      x: randomize ? Math.random() * width : -160,
      y: Math.random() * height,
      len: Math.random() * 220 + 220,
      speed: Math.random() * 0.8 + 0.45,
      angle: -0.38 + Math.random() * 0.12,
      alpha: Math.random() * 0.08 + 0.05
    };
  }

  function drawBackgroundWash(time) {
    const t = time * 0.00012;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(3, 8, 24, 0.55)");
    gradient.addColorStop(0.42, "rgba(5, 20, 42, 0.18)");
    gradient.addColorStop(1, "rgba(2, 8, 22, 0.55)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const auroras = [
      [width * (0.18 + Math.sin(t) * 0.04), height * (0.16 + Math.cos(t * 1.3) * 0.05), Math.min(width, height) * 0.55, "rgba(86, 199, 255, 0.105)"],
      [width * (0.84 + Math.cos(t * 0.8) * 0.05), height * (0.22 + Math.sin(t) * 0.04), Math.min(width, height) * 0.48, "rgba(45, 212, 191, 0.075)"],
      [width * (0.50 + Math.sin(t * 0.7) * 0.05), height * (0.82 + Math.cos(t * 0.9) * 0.04), Math.min(width, height) * 0.62, "rgba(45, 140, 255, 0.095)"]
    ];

    for (const [x, y, radius, color] of auroras) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(0.5, "rgba(0, 0, 0, 0)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHorizonGrid(time) {
    if (isScrolling) return;

    const horizon = height * 0.72;
    const vanishingX = width * 0.52 + Math.sin(time * 0.00018) * 20;
    const baseAlpha = isArticlePage ? 0.055 : 0.09;

    ctx.save();
    ctx.lineWidth = 1;

    for (let i = 0; i < 15; i++) {
      const y = horizon + Math.pow(i / 14, 1.8) * height * 0.34;
      const alpha = baseAlpha * (1 - i / 18);
      ctx.strokeStyle = `rgba(124, 240, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let i = -10; i <= 10; i++) {
      const bottomX = width * 0.5 + i * width * 0.09;
      ctx.strokeStyle = `rgba(86, 199, 255, ${baseAlpha * 0.9})`;
      ctx.beginPath();
      ctx.moveTo(vanishingX, horizon);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawStars(time) {
    ctx.save();
    for (const s of stars) {
      s.twinkle += 0.018;
      const alpha = s.a * (0.68 + Math.sin(s.twinkle) * 0.32);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190, 245, 255, ${alpha})`;
      ctx.fill();
    }
    ctx.restore();
  }

  function updateNodes() {
    const speed = isScrolling ? 0.18 : 1;
    for (const n of nodes) {
      n.x += n.vx * speed;
      n.y += n.vy * speed;
      n.phase += 0.012 * speed;
      if (n.x < -30) n.x = width + 30;
      if (n.x > width + 30) n.x = -30;
      if (n.y < -30) n.y = height + 30;
      if (n.y > height + 30) n.y = -30;
    }
  }

  function drawMesh() {
    const maxDistance = isArticlePage ? 95 : 138;
    const maxDistanceSq = maxDistance * maxDistance;

    ctx.save();

    if (!isScrolling) {
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > maxDistanceSq) continue;

          const distance = Math.sqrt(distSq);
          const alpha = (1 - distance / maxDistance) * (isArticlePage ? 0.08 : 0.15);
          const color = a.hue === 1 ? "45, 212, 191" : a.hue === 2 ? "251, 191, 36" : "86, 199, 255";

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${color}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      const pulse = 0.72 + Math.sin(n.phase) * 0.28;
      const color = n.hue === 1 ? "45, 212, 191" : n.hue === 2 ? "251, 191, 36" : "130, 240, 255";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.42)`;
      ctx.fill();
    }

    ctx.restore();
  }

  function drawStreaks() {
    if (isScrolling || isArticlePage) return;

    ctx.save();
    ctx.lineCap = "round";
    for (const s of streaks) {
      const dx = Math.cos(s.angle) * s.len;
      const dy = Math.sin(s.angle) * s.len;
      const g = ctx.createLinearGradient(s.x, s.y, s.x + dx, s.y + dy);
      g.addColorStop(0, "rgba(124, 240, 255, 0)");
      g.addColorStop(0.55, `rgba(124, 240, 255, ${s.alpha})`);
      g.addColorStop(1, "rgba(251, 191, 36, 0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + dx, s.y + dy);
      ctx.stroke();

      s.x += s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      if (s.x > width + s.len || s.y < -s.len) Object.assign(s, createStreak(false));
    }
    ctx.restore();
  }

  function drawScanline(time) {
    if (isScrolling || isArticlePage) return;
    const y = (time * 0.035) % (height + 180) - 90;
    const g = ctx.createLinearGradient(0, y - 45, 0, y + 45);
    g.addColorStop(0, "rgba(124, 240, 255, 0)");
    g.addColorStop(0.5, "rgba(124, 240, 255, 0.055)");
    g.addColorStop(1, "rgba(124, 240, 255, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 45, width, 90);
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);
    drawBackgroundWash(time);
    drawStars(time);
    drawHorizonGrid(time);
    drawStreaks();
    updateNodes();
    drawMesh();
    drawScanline(time);
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
