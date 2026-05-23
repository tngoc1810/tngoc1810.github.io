document.addEventListener("DOMContentLoaded", () => {
  initCyberBackground();
  setupFilters();
  initTocActiveHighlight();
});

/* =========================================================
   DUAL BACKGROUND SYSTEM
   Home: bold cinematic cyber hero.
   Writeups: lightweight elegant reading background.
   ========================================================= */

function initCyberBackground() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  removeOldBackgrounds();

  if (prefersReducedMotion || window.innerWidth <= 760) return;

  const isArticlePage = Boolean(document.querySelector(".article-layout"));
  const isWriteupsIndex = location.pathname.includes("writeups");

  if (isArticlePage || isWriteupsIndex) {
    document.body.classList.add("reading-bg-mode");
    initReadingBackground(isArticlePage);
    return;
  }

  document.body.classList.add("home-bg-mode");
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
  const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
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
  let stars = [];
  let shards = [];
  let streams = [];
  let orbitNodes = [];
  let lastFrame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  const fps = 32;
  const frameInterval = 1000 / fps;

  function createScene() {
    ({ width, height } = fitCanvas(canvas, ctx));

    stars = Array.from({ length: width < 1200 ? 90 : 145 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.25 + 0.2,
      a: Math.random() * 0.35 + 0.08,
      tw: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.05 + 0.015
    }));

    shards = Array.from({ length: width < 1200 ? 34 : 54 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.95 + 0.25,
      size: Math.random() * 34 + 16,
      speed: Math.random() * 0.42 + 0.2,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.006,
      hue: i % 4
    }));

    streams = Array.from({ length: width < 1200 ? 5 : 8 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 320 + 260,
      speed: Math.random() * 0.9 + 0.5,
      angle: -0.38 + Math.random() * 0.14,
      alpha: Math.random() * 0.13 + 0.08
    }));

    orbitNodes = Array.from({ length: 18 }, (_, i) => ({
      angle: (Math.PI * 2 * i) / 18,
      r: Math.min(width, height) * (0.16 + (i % 3) * 0.055),
      speed: 0.00018 + (i % 4) * 0.000035,
      size: 1.5 + (i % 3) * 0.55
    }));
  }

  function drawSpaceWash(time) {
    const t = time * 0.00012;
    ctx.fillStyle = "#020816";
    ctx.fillRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "rgba(2, 8, 22, 1)");
    bg.addColorStop(0.42, "rgba(6, 23, 45, 0.78)");
    bg.addColorStop(1, "rgba(2, 8, 22, 1)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const blobs = [
      [width * (0.20 + Math.sin(t) * 0.06), height * (0.15 + Math.cos(t * 1.2) * 0.05), Math.min(width, height) * 0.72, "rgba(86, 199, 255, 0.22)"],
      [width * (0.82 + Math.cos(t * 0.9) * 0.05), height * (0.22 + Math.sin(t) * 0.05), Math.min(width, height) * 0.62, "rgba(45, 212, 191, 0.14)"],
      [width * (0.55 + Math.sin(t * 0.7) * 0.05), height * (0.82 + Math.cos(t * 0.8) * 0.04), Math.min(width, height) * 0.64, "rgba(251, 191, 36, 0.10)"]
    ];

    for (const [x, y, radius, color] of blobs) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(0.42, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStars() {
    ctx.save();
    for (const s of stars) {
      s.tw += 0.018;
      s.y += s.drift;
      if (s.y > height + 10) {
        s.y = -10;
        s.x = Math.random() * width;
      }
      const alpha = s.a * (0.62 + Math.sin(s.tw) * 0.38);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 250, 255, ${alpha})`;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawHeroPortal(time) {
    const cx = width * (0.56 + (pointerX - 0.5) * 0.055);
    const cy = height * (0.42 + (pointerY - 0.5) * 0.045);
    const base = Math.min(width, height);

    ctx.save();
    ctx.translate(cx, cy);

    const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, base * 0.38);
    coreGlow.addColorStop(0, "rgba(124, 240, 255, 0.24)");
    coreGlow.addColorStop(0.35, "rgba(45, 140, 255, 0.09)");
    coreGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(0, 0, base * 0.38, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate(time * (0.00012 + i * 0.000035));
      ctx.scale(1, 0.36 + i * 0.035);
      ctx.beginPath();
      ctx.arc(0, 0, base * (0.15 + i * 0.045), 0, Math.PI * 2);
      ctx.strokeStyle = i % 2 === 0 ? `rgba(124, 240, 255, ${0.24 - i * 0.025})` : `rgba(45, 212, 191, ${0.18 - i * 0.02})`;
      ctx.lineWidth = i === 0 ? 2 : 1;
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < 28; i++) {
      const angle = (Math.PI * 2 * i) / 28 + time * 0.00018;
      const inner = base * 0.08;
      const outer = base * (0.24 + (i % 4) * 0.018);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner * 0.42);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer * 0.42);
      ctx.strokeStyle = i % 5 === 0 ? "rgba(251, 191, 36, 0.16)" : "rgba(124, 240, 255, 0.085)";
      ctx.lineWidth = i % 5 === 0 ? 1.4 : 1;
      ctx.stroke();
    }

    for (const n of orbitNodes) {
      const a = n.angle + time * n.speed;
      const x = Math.cos(a) * n.r;
      const y = Math.sin(a) * n.r * 0.42;
      ctx.beginPath();
      ctx.arc(x, y, n.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180, 250, 255, 0.78)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, n.size * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(86, 199, 255, 0.09)";
      ctx.fill();
    }

    ctx.restore();
  }

  function drawStreams() {
    ctx.save();
    ctx.lineCap = "round";
    for (const s of streams) {
      const dx = Math.cos(s.angle) * s.len;
      const dy = Math.sin(s.angle) * s.len;
      const g = ctx.createLinearGradient(s.x, s.y, s.x + dx, s.y + dy);
      g.addColorStop(0, "rgba(124, 240, 255, 0)");
      g.addColorStop(0.42, `rgba(124, 240, 255, ${s.alpha})`);
      g.addColorStop(0.74, `rgba(251, 191, 36, ${s.alpha * 0.42})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + dx, s.y + dy);
      ctx.stroke();

      s.x += s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      if (s.x > width + s.len || s.y < -s.len) {
        s.x = -s.len;
        s.y = Math.random() * height + height * 0.25;
      }
    }
    ctx.restore();
  }

  function drawShards(time) {
    ctx.save();
    ctx.lineWidth = 1;
    for (const sh of shards) {
      sh.x += sh.speed * sh.z;
      sh.y -= sh.speed * sh.z * 0.42;
      sh.angle += sh.spin;
      if (sh.x > width + 90 || sh.y < -90) {
        sh.x = -90;
        sh.y = Math.random() * height + height * 0.22;
      }

      const color = sh.hue === 1 ? "45, 212, 191" : sh.hue === 2 ? "251, 191, 36" : "86, 199, 255";
      ctx.save();
      ctx.translate(sh.x + (pointerX - 0.5) * sh.z * 28, sh.y + (pointerY - 0.5) * sh.z * 18);
      ctx.rotate(sh.angle);
      ctx.beginPath();
      ctx.moveTo(0, -sh.size * 0.45);
      ctx.lineTo(sh.size * 0.72, 0);
      ctx.lineTo(0, sh.size * 0.45);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${color}, ${0.12 + sh.z * 0.13})`;
      ctx.fillStyle = `rgba(${color}, ${0.018 + sh.z * 0.026})`;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawDepthGrid(time) {
    const horizon = height * 0.74;
    const vanishingX = width * (0.56 + (pointerX - 0.5) * 0.04);
    ctx.save();
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const y = horizon + Math.pow(i / 11, 1.9) * height * 0.32;
      ctx.strokeStyle = `rgba(86, 199, 255, ${0.12 * (1 - i / 13)})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let i = -11; i <= 11; i++) {
      const bottomX = width * 0.5 + i * width * 0.08;
      ctx.strokeStyle = "rgba(124, 240, 255, 0.06)";
      ctx.beginPath();
      ctx.moveTo(vanishingX, horizon);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawScan(time) {
    const y = (time * 0.05) % (height + 260) - 130;
    const g = ctx.createLinearGradient(0, y - 80, 0, y + 80);
    g.addColorStop(0, "rgba(124, 240, 255, 0)");
    g.addColorStop(0.5, "rgba(124, 240, 255, 0.075)");
    g.addColorStop(1, "rgba(124, 240, 255, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 80, width, 160);
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);
    drawSpaceWash(time);
    drawStars();
    drawDepthGrid(time);
    drawStreams();
    drawHeroPortal(time);
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
  const fps = isArticlePage ? 10 : 14;
  const frameInterval = 1000 / fps;

  function createScene() {
    ({ width, height } = fitCanvas(canvas, ctx));
    dots = Array.from({ length: isArticlePage ? 12 : 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.045,
      vy: (Math.random() - 0.5) * 0.04,
      r: Math.random() * 1 + 0.45,
      a: Math.random() * 0.10 + 0.045
    }));
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);

    const t = time * 0.000055;
    const g1 = ctx.createRadialGradient(width * (0.22 + Math.sin(t) * 0.018), height * 0.16, 0, width * 0.22, height * 0.16, Math.min(width, height) * 0.55);
    g1.addColorStop(0, "rgba(86, 199, 255, 0.065)");
    g1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const g2 = ctx.createRadialGradient(width * 0.82, height * (0.76 + Math.cos(t) * 0.018), 0, width * 0.82, height * 0.76, Math.min(width, height) * 0.55);
    g2.addColorStop(0, "rgba(45, 212, 191, 0.038)");
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
