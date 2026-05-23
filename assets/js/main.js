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
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
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
  let comets = [];
  let lastFrame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  const fps = 34;
  const frameInterval = 1000 / fps;

  function createScene() {
    ({ width, height } = fitCanvas(canvas, ctx));
    stars = Array.from({ length: width < 1200 ? 130 : 210 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.45 + 0.22,
      a: Math.random() * 0.42 + 0.10,
      tw: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.07 + 0.018
    }));

    shards = Array.from({ length: width < 1200 ? 52 : 82 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 1.1 + 0.25,
      size: Math.random() * 42 + 18,
      speed: Math.random() * 0.55 + 0.25,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.008,
      hue: i % 4
    }));

    streams = Array.from({ length: width < 1200 ? 8 : 12 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 420 + 330,
      speed: Math.random() * 1.15 + 0.75,
      angle: -0.42 + Math.random() * 0.16,
      alpha: Math.random() * 0.17 + 0.10
    }));

    comets = Array.from({ length: width < 1200 ? 2 : 3 }, () => resetComet(true));

    orbitNodes = Array.from({ length: 34 }, (_, i) => ({
      angle: (Math.PI * 2 * i) / 34,
      r: Math.min(width, height) * (0.13 + (i % 5) * 0.043),
      speed: 0.00022 + (i % 5) * 0.00004,
      size: 1.4 + (i % 4) * 0.48
    }));
  }

  function resetComet(randomize = false) {
    return {
      x: randomize ? Math.random() * width : -260,
      y: randomize ? Math.random() * height * 0.8 : Math.random() * height * 0.45 + 40,
      len: Math.random() * 360 + 380,
      speed: Math.random() * 2.2 + 1.8,
      alpha: Math.random() * 0.18 + 0.12,
      angle: -0.33 + Math.random() * 0.08
    };
  }

  function drawSpaceWash(time) {
    const t = time * 0.00013;
    ctx.fillStyle = "#010512";
    ctx.fillRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "rgba(2, 8, 22, 1)");
    bg.addColorStop(0.35, "rgba(4, 31, 57, 0.92)");
    bg.addColorStop(0.72, "rgba(8, 18, 40, 0.9)");
    bg.addColorStop(1, "rgba(2, 8, 22, 1)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const blobs = [
      [width * (0.20 + Math.sin(t) * 0.06), height * (0.15 + Math.cos(t * 1.2) * 0.05), Math.min(width, height) * 0.82, "rgba(86, 199, 255, 0.34)"],
      [width * (0.82 + Math.cos(t * 0.9) * 0.05), height * (0.25 + Math.sin(t) * 0.05), Math.min(width, height) * 0.70, "rgba(45, 212, 191, 0.24)"],
      [width * (0.56 + Math.sin(t * 0.7) * 0.05), height * (0.82 + Math.cos(t * 0.8) * 0.04), Math.min(width, height) * 0.72, "rgba(251, 191, 36, 0.16)"]
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
    for (const s of stars) {
      s.tw += 0.022;
      s.y += s.drift;
      if (s.y > height + 10) {
        s.y = -10;
        s.x = Math.random() * width;
      }
      const alpha = s.a * (0.55 + Math.sin(s.tw) * 0.45);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(215, 252, 255, ${alpha})`;
      ctx.fill();
    }
  }

  function drawHeroPortal(time) {
    const cx = width * (0.60 + (pointerX - 0.5) * 0.07);
    const cy = height * (0.42 + (pointerY - 0.5) * 0.055);
    const base = Math.min(width, height);

    ctx.save();
    ctx.translate(cx, cy);

    const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, base * 0.48);
    coreGlow.addColorStop(0, "rgba(124, 240, 255, 0.40)");
    coreGlow.addColorStop(0.28, "rgba(45, 140, 255, 0.18)");
    coreGlow.addColorStop(0.65, "rgba(45, 212, 191, 0.06)");
    coreGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(0, 0, base * 0.48, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 9; i++) {
      ctx.save();
      ctx.rotate(time * (0.00016 + i * 0.00004));
      ctx.scale(1, 0.32 + i * 0.027);
      ctx.beginPath();
      ctx.arc(0, 0, base * (0.11 + i * 0.04), 0, Math.PI * 2);
      ctx.strokeStyle = i % 3 === 0 ? `rgba(251, 191, 36, ${0.22 - i * 0.012})` : i % 2 === 0 ? `rgba(124, 240, 255, ${0.34 - i * 0.024})` : `rgba(45, 212, 191, ${0.25 - i * 0.018})`;
      ctx.lineWidth = i < 2 ? 2.2 : 1;
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < 44; i++) {
      const angle = (Math.PI * 2 * i) / 44 + time * 0.00025;
      const inner = base * 0.055;
      const outer = base * (0.30 + (i % 6) * 0.016);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner * 0.38);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer * 0.38);
      ctx.strokeStyle = i % 5 === 0 ? "rgba(251, 191, 36, 0.28)" : "rgba(124, 240, 255, 0.13)";
      ctx.lineWidth = i % 5 === 0 ? 1.8 : 1;
      ctx.stroke();
    }

    for (const n of orbitNodes) {
      const a = n.angle + time * n.speed;
      const x = Math.cos(a) * n.r;
      const y = Math.sin(a) * n.r * 0.38;
      ctx.beginPath();
      ctx.arc(x, y, n.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(210, 255, 255, 0.92)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, n.size * 4.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(86, 199, 255, 0.13)";
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
      g.addColorStop(0.38, `rgba(124, 240, 255, ${s.alpha})`);
      g.addColorStop(0.72, `rgba(251, 191, 36, ${s.alpha * 0.62})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.8;
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

  function drawComets() {
    ctx.save();
    ctx.lineCap = "round";
    for (const c of comets) {
      const dx = Math.cos(c.angle) * c.len;
      const dy = Math.sin(c.angle) * c.len;
      const g = ctx.createLinearGradient(c.x, c.y, c.x - dx, c.y - dy);
      g.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`);
      g.addColorStop(0.22, `rgba(124, 240, 255, ${c.alpha * 0.8})`);
      g.addColorStop(1, "rgba(124, 240, 255, 0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - dx, c.y - dy);
      ctx.stroke();
      c.x += c.speed;
      c.y += Math.sin(c.angle) * c.speed;
      if (c.x > width + c.len || c.y < -c.len) Object.assign(c, resetComet(false));
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
      ctx.translate(sh.x + (pointerX - 0.5) * sh.z * 34, sh.y + (pointerY - 0.5) * sh.z * 22);
      ctx.rotate(sh.angle);
      ctx.beginPath();
      ctx.moveTo(0, -sh.size * 0.5);
      ctx.lineTo(sh.size * 0.82, 0);
      ctx.lineTo(0, sh.size * 0.5);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${color}, ${0.16 + sh.z * 0.16})`;
      ctx.fillStyle = `rgba(${color}, ${0.025 + sh.z * 0.034})`;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawDepthGrid() {
    const horizon = height * 0.72;
    const vanishingX = width * (0.60 + (pointerX - 0.5) * 0.045);
    ctx.save();
    ctx.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
      const y = horizon + Math.pow(i / 17, 1.85) * height * 0.34;
      ctx.strokeStyle = `rgba(86, 199, 255, ${0.18 * (1 - i / 20)})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let i = -15; i <= 15; i++) {
      const bottomX = width * 0.5 + i * width * 0.07;
      ctx.strokeStyle = "rgba(124, 240, 255, 0.095)";
      ctx.beginPath();
      ctx.moveTo(vanishingX, horizon);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawScan(time) {
    const y = (time * 0.065) % (height + 300) - 150;
    const g = ctx.createLinearGradient(0, y - 90, 0, y + 90);
    g.addColorStop(0, "rgba(124, 240, 255, 0)");
    g.addColorStop(0.5, "rgba(124, 240, 255, 0.10)");
    g.addColorStop(1, "rgba(124, 240, 255, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 90, width, 180);
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);
    drawSpaceWash(time);
    drawStars();
    drawDepthGrid();
    drawStreams();
    drawComets();
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
  for (const selector of selectors) document.querySelectorAll(selector).forEach((element) => element.remove());
}

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

  function normalize(value) { return String(value || "").trim().toLowerCase(); }

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
      } else card.classList.add("hidden");
    }
    if (emptyState) emptyState.style.display = visibleCount === 0 ? "block" : "none";
  }

  for (const chip of chips) chip.addEventListener("click", () => {
    for (const item of chips) item.classList.remove("active");
    chip.classList.add("active");
    applyFilter();
  });

  if (searchInput) searchInput.addEventListener("input", debounce(applyFilter, 80));
  applyFilter();
}

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
    setTimeout(() => { button.textContent = "Copy"; }, 1200);
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
