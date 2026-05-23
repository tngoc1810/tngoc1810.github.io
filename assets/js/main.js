document.addEventListener("DOMContentLoaded", () => {
  initCyberBackground();
  setupFilters();
  initTocActiveHighlight();
});

/* =========================================================
   DUAL BACKGROUND SYSTEM
   Home: cinematic animated hero field.
   Writeups: lightweight reading background for smooth scrolling.
   ========================================================= */

function initCyberBackground() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  removeOldBackgrounds();

  if (prefersReducedMotion || window.innerWidth <= 760) return;

  const isArticlePage = Boolean(document.querySelector(".article-layout"));
  const isWriteupsIndex = location.pathname.includes("writeups");

  if (isArticlePage || isWriteupsIndex) {
    initReadingBackground(isArticlePage);
    return;
  }

  initHomeBackground();
}

function createBgCanvas() {
  const canvas = document.createElement("canvas");
  canvas.id = "network-bg";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  return { canvas, ctx };
}

function fitCanvas(canvas, ctx) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.3);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height, dpr };
}

function initHomeBackground() {
  const { canvas, ctx } = createBgCanvas();
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let rings = [];
  let shards = [];
  let stars = [];
  let lastFrame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  const fps = 30;
  const frameInterval = 1000 / fps;

  function createScene() {
    ({ width, height } = fitCanvas(canvas, ctx));
    pointerX = 0.5;
    pointerY = 0.5;

    rings = Array.from({ length: 4 }, (_, i) => ({
      x: width * (0.34 + i * 0.07),
      y: height * (0.42 + i * 0.025),
      r: Math.min(width, height) * (0.16 + i * 0.06),
      speed: 0.00008 + i * 0.000025,
      tilt: -0.55 + i * 0.18,
      alpha: 0.11 - i * 0.016
    }));

    shards = Array.from({ length: width < 1200 ? 22 : 34 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.8 + 0.2,
      size: Math.random() * 24 + 12,
      speed: Math.random() * 0.35 + 0.16,
      angle: Math.random() * Math.PI,
      hue: i % 4
    }));

    stars = Array.from({ length: width < 1200 ? 70 : 110 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.25,
      a: Math.random() * 0.28 + 0.06,
      tw: Math.random() * Math.PI * 2
    }));
  }

  function drawAurora(time) {
    const t = time * 0.00013;
    ctx.fillStyle = "rgba(2, 8, 22, 0.22)";
    ctx.fillRect(0, 0, width, height);

    const points = [
      [width * (0.22 + Math.sin(t) * 0.06), height * (0.18 + Math.cos(t * 1.3) * 0.05), Math.min(width, height) * 0.68, "rgba(86, 199, 255, 0.13)"],
      [width * (0.78 + Math.cos(t * 0.8) * 0.05), height * (0.26 + Math.sin(t) * 0.05), Math.min(width, height) * 0.56, "rgba(45, 212, 191, 0.10)"],
      [width * (0.52 + Math.sin(t * 0.7) * 0.06), height * (0.80 + Math.cos(t * 0.9) * 0.04), Math.min(width, height) * 0.62, "rgba(251, 191, 36, 0.07)"]
    ];

    for (const [x, y, r, color] of points) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(0.48, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStars() {
    for (const s of stars) {
      s.tw += 0.018;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(205, 245, 255, ${s.a * (0.65 + Math.sin(s.tw) * 0.35)})`;
      ctx.fill();
    }
  }

  function drawHoloCore(time) {
    const cx = width * (0.54 + (pointerX - 0.5) * 0.035);
    const cy = height * (0.46 + (pointerY - 0.5) * 0.03);

    ctx.save();
    ctx.translate(cx, cy);

    for (const ring of rings) {
      ctx.save();
      ctx.rotate(time * ring.speed);
      ctx.scale(1, 0.42 + Math.sin(ring.tilt) * 0.04);
      ctx.beginPath();
      ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(124, 240, 255, ${ring.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + time * 0.00012;
      const inner = Math.min(width, height) * 0.10;
      const outer = Math.min(width, height) * 0.34;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner * 0.45);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer * 0.45);
      ctx.strokeStyle = "rgba(86, 199, 255, 0.035)";
      ctx.stroke();
    }

    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(width, height) * 0.22);
    g.addColorStop(0, "rgba(124, 240, 255, 0.16)");
    g.addColorStop(0.5, "rgba(45, 140, 255, 0.05)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(width, height) * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawShards(time) {
    ctx.save();
    ctx.lineWidth = 1;
    for (const sh of shards) {
      sh.x += sh.speed * sh.z;
      sh.y -= sh.speed * sh.z * 0.38;
      sh.angle += 0.002 * sh.z;
      if (sh.x > width + 80 || sh.y < -80) {
        sh.x = -80;
        sh.y = Math.random() * height + height * 0.2;
      }

      const color = sh.hue === 1 ? "45, 212, 191" : sh.hue === 2 ? "251, 191, 36" : "86, 199, 255";
      ctx.save();
      ctx.translate(sh.x + (pointerX - 0.5) * sh.z * 18, sh.y + (pointerY - 0.5) * sh.z * 12);
      ctx.rotate(sh.angle);
      ctx.beginPath();
      ctx.moveTo(0, -sh.size * 0.35);
      ctx.lineTo(sh.size * 0.55, 0);
      ctx.lineTo(0, sh.size * 0.35);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${color}, ${0.07 + sh.z * 0.09})`;
      ctx.fillStyle = `rgba(${color}, ${0.012 + sh.z * 0.018})`;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawScan(time) {
    const y = (time * 0.045) % (height + 240) - 120;
    const g = ctx.createLinearGradient(0, y - 70, 0, y + 70);
    g.addColorStop(0, "rgba(124, 240, 255, 0)");
    g.addColorStop(0.5, "rgba(124, 240, 255, 0.06)");
    g.addColorStop(1, "rgba(124, 240, 255, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 70, width, 140);
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);
    drawAurora(time);
    drawStars();
    drawHoloCore(time);
    drawShards(time);
    drawScan(time);
  }

  function loop(time) {
    if (!lastFrame || time - lastFrame >= frameInterval) {
      lastFrame = time;
      render(time);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", debounce(createScene, 160), { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX / window.innerWidth;
    pointerY = event.clientY / window.innerHeight;
  }, { passive: true });

  createScene();
  requestAnimationFrame(loop);
}

function initReadingBackground(isArticlePage) {
  const { canvas, ctx } = createBgCanvas();
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dots = [];
  let lastFrame = 0;
  const fps = isArticlePage ? 12 : 16;
  const frameInterval = 1000 / fps;

  function createScene() {
    ({ width, height } = fitCanvas(canvas, ctx));
    dots = Array.from({ length: isArticlePage ? 16 : 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.07,
      vy: (Math.random() - 0.5) * 0.06,
      r: Math.random() * 1.1 + 0.5,
      a: Math.random() * 0.12 + 0.06
    }));
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);

    const t = time * 0.00008;
    const g1 = ctx.createRadialGradient(width * (0.22 + Math.sin(t) * 0.02), height * 0.16, 0, width * 0.22, height * 0.16, Math.min(width, height) * 0.52);
    g1.addColorStop(0, "rgba(86, 199, 255, 0.075)");
    g1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const g2 = ctx.createRadialGradient(width * 0.82, height * (0.76 + Math.cos(t) * 0.02), 0, width * 0.82, height * 0.76, Math.min(width, height) * 0.55);
    g2.addColorStop(0, "rgba(45, 212, 191, 0.045)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);

    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < -20) d.x = width + 20;
      if (d.x > width + 20) d.x = -20;
      if (d.y < -20) d.y = height + 20;
      if (d.y > height + 20) d.y = -20;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 235, 255, ${d.a})`;
      ctx.fill();
    }
  }

  function loop(time) {
    if (!lastFrame || time - lastFrame >= frameInterval) {
      lastFrame = time;
      render(time);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", debounce(createScene, 180), { passive: true });
  createScene();
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
